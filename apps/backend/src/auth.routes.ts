// apps/backend/src/auth.routes.ts
// Route: Register & Login dengan email/password

import { Elysia, t } from "elysia"
import { jwt } from "@elysiajs/jwt"
import type { DbClient } from "./types"

export const authRoutes = (getPrisma: () => DbClient) =>
  new Elysia({ prefix: "/auth" })
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET!, exp: "1d" }))

    // ── Register ────────────────────────────────────────────
    .post(
      "/register",
      async ({ body, jwt, set }) => {
        const { name, email, password } = body
        console.log("[REGISTER] body:", { name, email })

        let db: any
        try {
          db = getPrisma()
          console.log("[REGISTER] db ready:", !!db)
        } catch (e) {
          console.error("[REGISTER] getPrisma error:", e)
          set.status = 500
          return { message: "Database error: " + String(e) }
        }

        try {
          console.log("[REGISTER] checking existing user...")
          const existing = await db.user.findUnique({ where: { email } })
          if (existing) {
            set.status = 400
            return { message: "Email sudah terdaftar" }
          }

          console.log("[REGISTER] hashing password...")
          const hashedPassword = await Bun.password.hash(password)

          console.log("[REGISTER] creating user...")
          const user = await db.user.create({
            data: { name, email, password: hashedPassword },
          })
          console.log("[REGISTER] user created:", user.id)

          const token = await jwt.sign({ userId: user.id, email: user.email })

          return {
            accessToken: token,
            user: {
              id: String(user.id),
              name: user.name,
              email: user.email,
              avatarUrl: user.avatar_url ?? null,
              isGoogle: false,
            },
          }
        } catch (e) {
          console.error("[REGISTER] error:", e)
          set.status = 500
          return { message: "Register gagal: " + String(e) }
        }
      },
      {
        body: t.Object({
          name: t.String({ minLength: 1 }),
          email: t.String({ format: "email" }),
          password: t.String({ minLength: 4 }),
        }),
      }
    )

    // ── Login ───────────────────────────────────────────────
    .post(
      "/login",
      async ({ body, jwt, set }) => {
        const { email, password } = body
        console.log("[LOGIN] body:", { email })

        let db: any
        try {
          db = getPrisma()
        } catch (e) {
          console.error("[LOGIN] getPrisma error:", e)
          set.status = 500
          return { message: "Database error: " + String(e) }
        }

        try {
          const user = await db.user.findUnique({ where: { email } })
          if (!user || !user.password) {
            set.status = 401
            return { message: "Email atau password salah" }
          }

          const valid = await Bun.password.verify(password, user.password)
          if (!valid) {
            set.status = 401
            return { message: "Email atau password salah" }
          }

          const token = await jwt.sign({ userId: user.id, email: user.email })

          return {
            accessToken: token,
            user: {
              id: String(user.id),
              name: user.name,
              email: user.email,
              avatarUrl: user.avatar_url ?? null,
              isGoogle: false,
            },
          }
        } catch (e) {
          console.error("[LOGIN] error:", e)
          set.status = 500
          return { message: "Login gagal: " + String(e) }
        }
      },
      {
        body: t.Object({
          email: t.String({ format: "email" }),
          password: t.String({ minLength: 1 }),
        }),
      }
    )