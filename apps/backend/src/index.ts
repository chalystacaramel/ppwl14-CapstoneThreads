import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import type { ApiResponse, HealthCheck, User } from "shared";
import type { DbClient } from "./types";
import { authRoutes } from "./auth.routes";
import { postRoutes } from "./posts.routes";
import { notificationRoutes } from "./notifications.routes";

export const createApp = (getPrisma: () => DbClient) => {
  const app = new Elysia()
    .use(cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }))
    .use(cookie())
    .use(
      jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET!,
        exp: "1d",
      })
    )

    // Middleware debug + /users key guard
    .onRequest(({ request, set }) => {
      const url = new URL(request.url);
      console.log(`[${request.method}] ${url.pathname}`);
      if (request.method === "OPTIONS") return;
      if (!url.pathname.startsWith("/users")) return;
      const origin = request.headers.get("origin");
      const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
      const key = url.searchParams.get("key");
      if (origin === frontendUrl) return;
      if (key !== process.env.API_KEY) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
    })

    // Health check
    .get("/", (): ApiResponse<HealthCheck> => ({
      data: { status: "ok" },
      message: "server running",
    }))

    // Users list (admin)
    .get("/users", async () => {
      const users = await getPrisma().user.findMany();
      const response: ApiResponse<User[]> = {
        data: users,
        message: "User list retrieved",
      };
      return response;
    })

    // ── Routes ─────────────────────────────────────────────────
    .use(authRoutes(getPrisma))
    .use(postRoutes(getPrisma))
    .use(notificationRoutes(getPrisma));

  return app;
};