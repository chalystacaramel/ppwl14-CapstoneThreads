import { PrismaClient } from "../src/generated/prisma/client.ts"
import { PrismaLibSql } from "@prisma/adapter-libsql/web"
import path from "path"

export const getDbUrl = () => process.env.DATABASE_URL || `file:${path.resolve(__dirname, "../dev.db")}`

let prisma: PrismaClient

export const getPrisma = () => {
  if (!prisma) {
    const currentDbUrl = getDbUrl();
    console.log("[DB] Connecting to:", currentDbUrl)
    const adapter = new PrismaLibSql({ url: currentDbUrl, authToken: process.env.DB_AUTH_TOKEN })
    prisma = new PrismaClient({ adapter })
  }
  return prisma
}