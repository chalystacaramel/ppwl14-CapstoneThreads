import { createApp } from "./index";
import { loadConfig } from "./config";
import { getPrisma } from "../prisma/db";

let app: ReturnType<typeof createApp>;

export const handler = async (event: any) => {
  await loadConfig();

  if (!app) {
    app = createApp(getPrisma);
  }

  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
  const requestOrigin = event.headers?.origin || event.headers?.Origin || frontendUrl;
  
  if (event.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": requestOrigin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
      body: "",
    };
  }

  const url = `https://${event.headers.host}${event.rawPath}${event.rawQueryString ? "?" + event.rawQueryString : ""
    }`;

  const response = await app.handle(
    new Request(url, {
      method: event.requestContext.http.method,
      headers: event.headers,
      body: event.body
        ? Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8")
        : undefined,
    })
  );

  return {
    statusCode: response.status,
    headers: {
      ...Object.fromEntries(response.headers),
      "Access-Control-Allow-Origin": requestOrigin,
      "Access-Control-Allow-Credentials": "true",
    },
    body: await response.text(),
    isBase64Encoded: false,
  };
};