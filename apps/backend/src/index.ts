import { Elysia } from "elysia";
import { cookie } from "@elysiajs/cookie";
import type { DbClient } from "./types";
import { authRoutes } from "./routes/auth.routes";
import { postRoutes } from "./routes/posts.routes";
import { notificationRoutes } from "./routes/notifications.routes";
export const createApp = (getPrisma: () => DbClient) => {
  const app = new Elysia()
    .use(cookie())

    .get("/", () => ({ data: { status: "ok" }, message: "server running" }))

    .use(authRoutes(getPrisma))
    .use(postRoutes(getPrisma))
    .use(notificationRoutes(getPrisma));

  return app;
};