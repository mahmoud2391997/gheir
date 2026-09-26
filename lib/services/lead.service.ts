import { connectMongo } from "../db/mongoose";
import { Lead } from "../db/models";
import { AppError } from "../errors";
import type { z } from "zod";
import type { leadPatchSchema, leadSchema } from "../validation/schemas";

type LeadInput = z.infer<typeof leadSchema>;
type LeadPatch = z.infer<typeof leadPatchSchema>;

export async function createLead(input: LeadInput) {
  if (!input.email && !input.phone?.trim()) {
    throw new AppError("VALIDATION_ERROR", "email or phone is required", 400);
  }
  await connectMongo();
  const message = input.message?.trim() || undefined;
  return Lead.create({
    name: input.name,
    email: input.email || undefined,
    phone: input.phone?.trim() || undefined,
    company: input.company?.trim() || undefined,
    source: input.source?.trim() || "website",
    status: "new",
    message,
    notes: message,
  });
}

export async function listLeads() {
  await connectMongo();
  return Lead.find().sort({ createdAt: -1 }).lean();
}

export async function updateLead(id: string, patch: LeadPatch) {
  await connectMongo();
  const lead = await Lead.findByIdAndUpdate(id, patch, { new: true, runValidators: true }).lean();
  if (!lead) throw new AppError("NOT_FOUND", "Lead not found", 404);
  return lead;
}

export async function deleteLead(id: string) {
  await connectMongo();
  const lead = await Lead.findByIdAndDelete(id).lean();
  if (!lead) throw new AppError("NOT_FOUND", "Lead not found", 404);
}
