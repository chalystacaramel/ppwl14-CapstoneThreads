import { Elysia, t } from "elysia"
import { jwt } from "@elysiajs/jwt"
import bcrypt from "bcryptjs"
import type { DbClient } from "./types"

async function verifyGoogleToken(token: string) {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
  )
  if (!res.ok) {
    throw new Error("Invalid Google token")
  }
  return res.json() as Promise<{
    sub: string
    email: string
    name: string
    picture: string
  }>
}

export const authRoutes = (getPrisma: () => DbClient) =>
  new Elysia({ prefix: "/auth" })
    .use(
      jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET || "dev-secret",
        exp: "1d",
      })
    )

    // REGISTER
    .post(
      "/register",
      async ({ body, jwt, set }) => {
        const { name, email, password } = body
        try {
          const db = getPrisma()
          const existing = await db.user.findUnique({ where: { email } })
          if (existing) {
            set.status = 400
            return { message: "Email sudah terdaftar" }
          }
          const hashedPassword = await bcrypt.hash(password, 10)
          const user = await db.user.create({
            data: { name, email, password: hashedPassword },
          })
          const token = await jwt.sign({ userId: user.id, email: user.email })
          return {
            accessToken: token,
            user: {
              id: String(user.id),
              name: user.name,
              email: user.email,
              avatarUrl: user.avatar_url ?? null,
            },
          }
        } catch (e) {
          console.error("REGISTER ERROR:", e)
          set.status = 500
          return { message: "Register gagal", error: String(e) }
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

    // LOGIN
    .post(
      "/login",
      async ({ body, jwt, set }) => {
        const { email, password } = body
        try {
          const db = getPrisma()
          const user = await db.user.findUnique({ where: { email } })
          if (!user || !user.password) {
            set.status = 401
            return { message: "Email atau password salah" }
          }
          const valid = await bcrypt.compare(password, user.password)
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
            },
          }
        } catch (e) {
          console.error("LOGIN ERROR:", e)
          set.status = 500
          return { message: "Login gagal", error: String(e) }
        }
      },
      {
        body: t.Object({
          email: t.String({ format: "email" }),
          password: t.String({ minLength: 1 }),
        }),
      }
    )

    // GOOGLE LOGIN
    .post(
      "/google",
      async ({ body, jwt, set }) => {
        const { token } = body
        try {
          const db = getPrisma()
          const googleUser = await verifyGoogleToken(token)
          let user = await db.user.findUnique({ where: { email: googleUser.email } })
          if (!user) {
            user = await db.user.create({
              data: {
                name: googleUser.name,
                email: googleUser.email,
                avatar_url: googleUser.picture,
                password: null,
              },
            })
          }
          const accessToken = await jwt.sign({ userId: user.id, email: user.email })
          return {
            accessToken,
            user: {
              id: String(user.id),
              name: user.name,
              email: user.email,
              avatarUrl: user.avatar_url ?? null,
            },
          }
        } catch (e) {
          console.error("GOOGLE LOGIN ERROR:", e)
          set.status = 401
          return { message: "Login Google gagal", error: String(e) }
        }
      },
      {
        body: t.Object({
          token: t.String(),
        }),
      }
    )
