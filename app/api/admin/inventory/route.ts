import { json, readJson, withApi } from "@/lib/api/respond";
import { adjustInventory } from "@/lib/services/product.service";
import { requireAdmin } from "@/lib/security/admin";
import { inventoryAdjustSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const POST = withApi(async (request) => {
  const session = await requireAdmin(request);
  const input = inventoryAdjustSchema.parse(await readJson(request));
  return json({ inventory: await adjustInventory(input.sku, input.stock, session.email) });
});
