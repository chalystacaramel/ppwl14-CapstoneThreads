import { PrismaLibSql } from "@prisma/adapter-libsql/web"
import { PrismaClient } from "../src/generated/prisma/client.ts"

export const getDbUrl = () => process.env.DATABASE_URL || "file:./dev.db"

let prisma: PrismaClient

export const getPrisma = () => {
  if (!prisma) {
    const url = getDbUrl()
    console.log("[DB] Connecting to:", url)
    const adapter = new PrismaLibSql({
      url,
      authToken: process.env.DB_AUTH_TOKEN,
    })
    prisma = new PrismaClient({ adapter })
  }
  return prisma
}