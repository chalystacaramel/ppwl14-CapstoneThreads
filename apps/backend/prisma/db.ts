// apps/backend/prisma/db.ts - LOCAL DEV (SQLite / Turso)
import { PrismaClient } from "../src/generated/prisma/client.js"

export const getDbUrl = () => process.env.DATABASE_URL || "file:./dev.db"

let prisma: PrismaClient | undefined
let lastUrl: string | undefined

export const getPrisma = () => {
  const url = getDbUrl()

  if (prisma && lastUrl !== url) {
    prisma = undefined
  }

  if (!prisma) {
    lastUrl = url
    console.log("[DB] Connecting to:", url.startsWith("file:") ? "SQLite local" : "Turso")

    if (url.startsWith("file:")) {
      const { PrismaLibSql } = require("@prisma/adapter-libsql")
      const adapter = new PrismaLibSql({ url })
      prisma = new PrismaClient({ adapter } as any)
    } else {
      // Turso (libsql:// atau https://)
      const { PrismaLibSql } = require("@prisma/adapter-libsql")
      const adapter = new PrismaLibSql({
        url,
        authToken: process.env.DB_AUTH_TOKEN,
      })
      prisma = new PrismaClient({ adapter } as any)
    }
  }

  return prisma
}