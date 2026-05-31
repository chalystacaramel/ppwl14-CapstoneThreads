import { Elysia } from "elysia";
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
    .use(cookie())
    .get("/", (): ApiResponse<HealthCheck> => ({
      data: { status: "ok" },
      message: "server running",
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