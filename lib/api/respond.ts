import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "../errors";

export function json(body: unknown, status = 200, extra?: HeadersInit) {
  const response = NextResponse.json(body, { status });
  const headers = new Headers(extra);
  headers.forEach((value, key) => response.headers.set(key, value));
  return response;
}

export function toErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, ...(error.details === undefined ? {} : { details: error.details }) } },
      { status: error.status },
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid request", details: error.flatten() } },
      { status: 400 },
    );
  }
  console.error(error);
  return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
}

export function withApi(handler: (request: Request) => Promise<Response>): (request: Request) => Promise<Response>;
export function withApi<C>(handler: (request: Request, context: C) => Promise<Response>): (request: Request, context: C) => Promise<Response>;
export function withApi(handler: (request: Request, context?: unknown) => Promise<Response>) {
  return async (request: Request, context?: unknown) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function assertJsonSize(request: Request, max = 1_000_000) {
  const length = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(length) && length > max) {
    throw new AppError("VALIDATION_ERROR", "Request is too large", 413);
  }
}

export async function readJson(request: Request) {
  assertJsonSize(request);
  try {
    return await request.json();
  } catch {
    throw new AppError("VALIDATION_ERROR", "Invalid JSON", 400);
  }
}
