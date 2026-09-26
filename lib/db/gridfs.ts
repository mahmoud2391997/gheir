import { GridFSBucket, ObjectId, type Db } from "mongodb";
import mongoose from "mongoose";
import { connectMongo } from "./mongoose";
import { AppError } from "../errors";

async function database(): Promise<Db> {
  const connection = await connectMongo();
  if (!connection.connection.db) throw new AppError("INTERNAL_ERROR", "Something went wrong", 500);
  return connection.connection.db;
}

function bucket(db: Db) {
  return new GridFSBucket(db, { bucketName: "assets" });
}

export async function uploadAsset(buffer: Buffer, filename: string, contentType: string) {
  const db = await database();
  const upload = bucket(db).openUploadStream(filename, { metadata: { contentType } });
  await new Promise<void>((resolve, reject) => {
    upload.once("finish", () => resolve());
    upload.once("error", reject);
    upload.end(buffer);
  });
  return upload.id.toString();
}

export async function openAsset(id: string) {
  if (!mongoose.isValidObjectId(id)) throw new AppError("NOT_FOUND", "Image not found", 404);
  const db = await database();
  const files = await bucket(db).find({ _id: new ObjectId(id) }).toArray();
  const file = files[0];
  if (!file) throw new AppError("NOT_FOUND", "Image not found", 404);
  const stored = file as { contentType?: unknown; metadata?: { contentType?: unknown } };
  const contentType = typeof stored.contentType === "string" ? stored.contentType : typeof stored.metadata?.contentType === "string" ? stored.metadata.contentType : "application/octet-stream";
  if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
    throw new AppError("NOT_FOUND", "Image not found", 404);
  }
  return { contentType, stream: bucket(db).openDownloadStream(new ObjectId(id)) };
}
