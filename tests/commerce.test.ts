import { describe, expect, it } from "vitest";
import { AppError } from "@/lib/errors";
import { createOrder, updateOrderStatus } from "@/lib/services/order.service";
import { processPosSale } from "@/lib/services/pos.service";
import { adjustInventory, createProduct } from "@/lib/services/product.service";
import type { StockSnapshot } from "@/lib/services/store";
import { orderRequestSchema, posSaleSchema, productWriteSchema } from "@/lib/validation/schemas";
import { createMemoryGateway } from "./memory-gateway";

const customer = { name: "Mona", phone: "01000000000" };

function chair(stock = 2, status: StockSnapshot["status"] = "published"): StockSnapshot {
  return { id: "p1", sku: "CHAIR", name: "Saha Chair", slug: "saha-chair", price: 25000, currency: "EGP", stock, status };
}

describe("website orders", () => {
  it("prices a valid order from the database", async () => {
    const { gateway, state } = createMemoryGateway([chair()]);
    const parsed = orderRequestSchema.parse({ customer, items: [{ sku: "CHAIR", quantity: 1, unitPrice: 1, subtotal: 1 }] });
    const order = await createOrder(parsed, undefined, gateway);
    expect(order.items[0]?.unitPrice).toBe(25000);
    expect(order.subtotal).toBe(25000);
    expect(order.items[0]?.name).toBe("Saha Chair");
    expect(state.products[0]?.stock).toBe(1);
    expect(state.ledger[0]?.type).toBe("SALE");
  });

  it("rejects an unknown SKU", async () => {
    const { gateway } = createMemoryGateway([chair()]);
    await expect(createOrder({ customer, items: [{ sku: "MISSING", quantity: 1 }] }, undefined, gateway)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects invalid quantities", () => {
    for (const quantity of [0, -1, 1.5, 21]) {
      expect(orderRequestSchema.safeParse({ customer, items: [{ sku: "CHAIR", quantity }] }).success).toBe(false);
    }
  });

  it("rejects a non-integer quantity", () => {
    expect(orderRequestSchema.safeParse({ customer, items: [{ sku: "CHAIR", quantity: 1.2 }] }).success).toBe(false);
  });

  it("does not let the client set the price or subtotal", async () => {
    const { gateway } = createMemoryGateway([chair()]);
    const parsed = orderRequestSchema.parse({ customer, items: [{ sku: "chair", quantity: 1, unitPrice: 1 }], subtotal: 1 });
    await expect(createOrder({ ...parsed, items: parsed.items.map((item) => ({ ...item, sku: "CHAIR" })) }, undefined, gateway)).resolves.toMatchObject({ subtotal: 25000 });
  });

  it("rejects an out-of-stock product", async () => {
    const { gateway, state } = createMemoryGateway([chair(0)]);
    await expect(createOrder({ customer, items: [{ sku: "CHAIR", quantity: 1 }] }, undefined, gateway)).rejects.toMatchObject({ code: "OUT_OF_STOCK" });
    expect(state.products[0]?.stock).toBe(0);
  });

  it("rejects an inactive product", async () => {
    const { gateway } = createMemoryGateway([chair(4, "draft")]);
    await expect(createOrder({ customer, items: [{ sku: "CHAIR", quantity: 1 }] }, undefined, gateway)).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("allows only one of two concurrent purchases of the last unit", async () => {
    const { gateway, state } = createMemoryGateway([chair(1)]);
    const results = await Promise.allSettled([
      createOrder({ customer, items: [{ sku: "CHAIR", quantity: 1 }] }, "order-a", gateway),
      createOrder({ customer, items: [{ sku: "CHAIR", quantity: 1 }] }, "order-b", gateway),
    ]);
    const fulfilled = results.filter((result) => result.status === "fulfilled");
    const rejected = results.filter((result) => result.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0]?.status === "rejected" && rejected[0].reason).toBeInstanceOf(AppError);
    expect(state.products[0]?.stock).toBe(0);
    expect(state.orders).toHaveLength(1);
  });

  it("does not decrement stock twice for the same idempotency key", async () => {
    const { gateway, state } = createMemoryGateway([chair()]);
    const first = await createOrder({ customer, items: [{ sku: "CHAIR", quantity: 1 }] }, "same-key", gateway);
    const second = await createOrder({ customer, items: [{ sku: "CHAIR", quantity: 1 }] }, "same-key", gateway);
    expect(second.deduped).toBe(true);
    expect(second.orderId).toBe(first.orderId);
    expect(state.products[0]?.stock).toBe(1);
  });

  it("returns stock when an order is cancelled", async () => {
    const { gateway, state } = createMemoryGateway([chair(1)]);
    const order = await createOrder({ customer, items: [{ sku: "CHAIR", quantity: 1 }] }, undefined, gateway);
    await updateOrderStatus(order.orderId, "cancelled", gateway);
    expect(state.products[0]?.stock).toBe(1);
    expect(state.ledger.some((row) => row.type === "RETURN")).toBe(true);
  });
});

describe("POS sales", () => {
  it("prices a sale from the database and records a ledger entry", async () => {
    const { gateway, state } = createMemoryGateway([chair(3)]);
    const parsed = posSaleSchema.parse({ clientSaleId: "sale-1", items: [{ sku: "CHAIR", quantity: 2, unitPrice: 1 }] });
    const sale = await processPosSale(parsed, gateway);
    expect(sale.deduped).toBe(false);
    expect(sale.subtotal).toBe(50000);
    expect(state.products[0]?.stock).toBe(1);
    expect(state.ledger[0]?.type).toBe("POS_SALE");
  });

  it("does not create a second sale for the same clientSaleId", async () => {
    const { gateway, state } = createMemoryGateway([chair(3)]);
    await processPosSale({ clientSaleId: "sale-1", items: [{ sku: "CHAIR", quantity: 1 }] }, gateway);
    const again = await processPosSale({ clientSaleId: "sale-1", items: [{ sku: "CHAIR", quantity: 1 }] }, gateway);
    expect(again.deduped).toBe(true);
    expect(state.products[0]?.stock).toBe(2);
    expect(state.sales).toHaveLength(1);
  });

  it("rejects an unknown SKU and a bad quantity", async () => {
    const { gateway } = createMemoryGateway([chair()]);
    await expect(processPosSale({ clientSaleId: "sale-x", items: [{ sku: "NOPE", quantity: 1 }] }, gateway)).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(posSaleSchema.safeParse({ clientSaleId: "sale-x", items: [{ sku: "CHAIR", quantity: 0 }] }).success).toBe(false);
  });

  it("lets an offline sale take stock negative and keeps concurrent sync idempotent", async () => {
    const { gateway, state } = createMemoryGateway([chair(1)]);
    const results = await Promise.all([
      processPosSale({ clientSaleId: "offline-1", items: [{ sku: "CHAIR", quantity: 1 }] }, gateway),
      processPosSale({ clientSaleId: "offline-1", items: [{ sku: "CHAIR", quantity: 1 }] }, gateway),
      processPosSale({ clientSaleId: "offline-2", items: [{ sku: "CHAIR", quantity: 1 }] }, gateway),
    ]);
    expect(results.filter((result) => result.deduped)).toHaveLength(1);
    expect(state.sales).toHaveLength(2);
    expect(state.products[0]?.stock).toBe(-1);
    expect(results.some((result) => result.warnings.some((warning) => warning.stockAfter < 0))).toBe(true);
  });
});

describe("products", () => {
  it("creates a product and rejects a duplicate SKU", async () => {
    const { gateway } = createMemoryGateway([]);
    const created = await createProduct({ name: "Chair", category: "saha", price: 10, sku: "CHAIR", stock: 2, status: "published" }, "admin@example.com", gateway);
    expect(created.sku).toBe("CHAIR");
    await expect(createProduct({ name: "Other", category: "saha", price: 10, sku: "CHAIR", slug: "other" }, "admin@example.com", gateway)).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("rejects an invalid price or stock", () => {
    expect(productWriteSchema.safeParse({ name: "Chair", category: "saha", price: -1 }).success).toBe(false);
    expect(productWriteSchema.safeParse({ name: "Chair", category: "saha", price: 10, stock: -1 }).success).toBe(false);
    expect(productWriteSchema.safeParse({ name: "Chair", category: "saha", price: 10, stock: 1.5 }).success).toBe(false);
  });

  it("adjusts inventory with a ledger row", async () => {
    const { gateway, state } = createMemoryGateway([chair(1)]);
    await adjustInventory("CHAIR", 5, "admin@example.com", gateway);
    expect(state.products[0]?.stock).toBe(5);
    expect(state.ledger[0]?.type).toBe("RESTOCK");
    expect(state.ledger[0]?.previousStock).toBe(1);
    expect(state.ledger[0]?.newStock).toBe(5);
  });
});
