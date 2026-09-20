import { GridFSBucket, type Db, ObjectId } from "mongodb";
import mongoose from "mongoose";
import { connectMongo } from "./client.js";

async function database(): Promise<Db> { const connection = await connectMongo(); if (!connection.connection.db) throw new Error("Mongo database is unavailable"); return connection.connection.db; }
export async function uploadAsset(stream: NodeJS.ReadableStream, filename: string, contentType?: string) { const bucket = new GridFSBucket(await database(), { bucketName: "assets" }); return new Promise<string>((resolve, reject) => { const upload = bucket.openUploadStream(filename, { contentType }); stream.pipe(upload); upload.once("finish", () => resolve(upload.id.toString())); upload.once("error", reject); }); }
export async function downloadAsset(id: string) { const bucket = new GridFSBucket(await database(), { bucketName: "assets" }); return bucket.openDownloadStream(new ObjectId(id)); }
export async function deleteAsset(id: string) { const bucket = new GridFSBucket(await database(), { bucketName: "assets" }); await bucket.delete(new ObjectId(id)); }
