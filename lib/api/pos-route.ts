import { authenticatePos, posCorsHeaders, rejectDisallowedOrigin } from "../security/pos";
import { toErrorResponse } from "./respond";

function applyCors(response: Response, cors: Headers) {
  cors.forEach((value, key) => response.headers.set(key, value));
  return response;
}

export function withPos(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    const cors = posCorsHeaders(request);
    try {
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
      authenticatePos(request);
      const response = await handler(request);
      response.headers.set("Cache-Control", "private, no-store");
      return applyCors(response, cors);
    } catch (error) {
      return applyCors(toErrorResponse(error), cors);
    }
  };
}

export function withPosCors(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    const cors = posCorsHeaders(request);
    try {
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
      rejectDisallowedOrigin(request);
      const response = await handler(request);
      return applyCors(response, cors);
    } catch (error) {
      return applyCors(toErrorResponse(error), cors);
    }
  };
}
