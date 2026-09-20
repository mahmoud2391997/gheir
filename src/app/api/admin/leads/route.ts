import { NextResponse } from "next/server";
import { connectMongo } from "../../../../../server/mongodb/client";
import { Lead } from "../../../../../server/mongodb/models";

export async function GET() {
  await connectMongo();
  const leads = await Lead.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ leads });
}
