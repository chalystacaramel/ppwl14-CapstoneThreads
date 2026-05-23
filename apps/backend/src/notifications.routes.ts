// apps/backend/src/notifications.routes.ts
// Routes: Notifikasi user

import { Elysia } from "elysia"
import { jwt } from "@elysiajs/jwt"
import type { DbClient } from "./types"

async function getUser(headers: any, jwtInstance: any, set: any) {
  const authHeader = headers.authorization
  if (!authHeader) { set.status = 401; return null }
  const token = authHeader.replace("Bearer ", "")
  const payload = await jwtInstance.verify(token)
  if (!payload) { set.status = 401; return null }
  return payload as { userId: number; email: string }
}

export const notificationRoutes = (getPrisma: () => DbClient) =>
  new Elysia({ prefix: "/notifications" })
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET!, exp: "1d" }))

    // ── GET /notifications — list notif user yang login ────────
    .get("/", async ({ headers, jwt, set }) => {
      const me = await getUser(headers, jwt, set)
      if (!me) return { message: "Unauthorized" }

      const db = getPrisma() as any

      const notifs = await db.notification.findMany({
        where: { userId: me.userId },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          actor: { select: { id: true, name: true, avatar_url: true } },
          post: { select: { id: true, content: true } },
        },
      })

      return notifs.map((n: any) => ({
        id: String(n.id),
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt,
        actor: {
          id: String(n.actor.id),
          name: n.actor.name,
          avatarUrl: n.actor.avatar_url ?? null,
          username: n.actor.name.toLowerCase().replace(/\s+/g, "_"),
        },
        post: n.post ? {
          id: String(n.post.id),
          content: n.post.content?.slice(0, 60) + (n.post.content?.length > 60 ? "..." : ""),
        } : null,
      }))
    })

    // ── PATCH /notifications/:id/read — tandai sudah dibaca ────
    .patch("/:id/read", async ({ params, headers, jwt, set }) => {
      const me = await getUser(headers, jwt, set)
      if (!me) return { message: "Unauthorized" }

      const db = getPrisma() as any
      const notifId = parseInt(params.id)

      await db.notification.updateMany({
        where: { id: notifId, userId: me.userId },
        data: { isRead: true },
      })

      return { message: "Ditandai sudah dibaca" }
    })

    // ── PATCH /notifications/read-all — tandai semua dibaca ────
    .patch("/read-all", async ({ headers, jwt, set }) => {
      const me = await getUser(headers, jwt, set)
      if (!me) return { message: "Unauthorized" }

      const db = getPrisma() as any

      await db.notification.updateMany({
        where: { userId: me.userId, isRead: false },
        data: { isRead: true },
      })

      return { message: "Semua notifikasi ditandai dibaca" }
    })

    // ── GET /notifications/unread-count — jumlah belum dibaca ──
    .get("/unread-count", async ({ headers, jwt, set }) => {
      const me = await getUser(headers, jwt, set)
      if (!me) return { message: "Unauthorized" }

      const db = getPrisma() as any

      const count = await db.notification.count({
        where: { userId: me.userId, isRead: false },
      })

      return { count }
    })