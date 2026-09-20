import { NextResponse } from "next/server";
import { connectMongo } from "../../../../../server/mongodb/client";
import { Product } from "../../../../../server/mongodb/models";

export async function GET() {
  await connectMongo();
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ products });
}
