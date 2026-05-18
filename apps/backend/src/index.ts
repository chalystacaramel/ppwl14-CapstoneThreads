import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import type { DbClient } from "./types";
import { authRoutes } from "./auth.routes";

export const createApp = (getPrisma: () => DbClient) => {
  const app = new Elysia()
    .use(cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }))
    .use(cookie())
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET!, exp: "1d" }))

    .onRequest(({ request, set }) => {
      const url = new URL(request.url);
      console.log(`[DEBUG] [${request.method}] ${url.pathname}`);
      if (request.method === "OPTIONS") return;
      if (!url.pathname.startsWith("/users")) return;
      const origin = request.headers.get("origin");
      const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
      const key = url.searchParams.get("key");
      if (origin === frontendUrl) return;
      if (key !== process.env.API_KEY) {
        set.status = 401;
        return { message: "Unauthorized: Access denied without valid API Key" };
      }
    })

    .get("/", () => ({ data: { status: "ok" }, message: "server running" }))

    .get("/users", async () => {
      const users = await getPrisma().user.findMany();
      return { data: users, message: "User list retrieved" };
    })

    .use(authRoutes(getPrisma));

  return app;
};