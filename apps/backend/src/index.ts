import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { cookie } from "@elysiajs/cookie";
import type { DbClient } from "./types";
import type { ApiResponse, HealthCheck } from "shared";
import { authRoutes } from "./routes/auth.routes";
import { postRoutes } from "./routes/postRoutes";
import { notificationRoutes } from "./routes/notifications.routes";
import { dataRoutes } from "./routes/dataRoutes";
import { commentRoutes } from "./routes/commentRoutes";

export const createApp = (getPrisma: () => DbClient) => {

  const app = new Elysia()
    .use(
      cors({
        origin: "*", // Mengizinkan semua domain/origin (Public Access)
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Metode HTTP yang diizinkan
        allowedHeaders: ["Content-Type", "Authorization"], // Header yang diizinkan dari frontend
      })
    )
    .use(cookie())
    .get("/", (): ApiResponse<HealthCheck> => ({
      data: { status: "ok" },
      message: "[v3] server running" + process.env.AWS_ACCESS_KEY_ID,
    }))

    // public
    .use(authRoutes(getPrisma))
    .use(dataRoutes(getPrisma))

    // protected
    .use(postRoutes(getPrisma))
    .use(notificationRoutes(getPrisma))
    .use(commentRoutes(getPrisma));

  return app;
};