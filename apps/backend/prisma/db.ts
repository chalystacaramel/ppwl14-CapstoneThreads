import { PrismaClient } from "../src/generated/prisma/client.ts"
import { PrismaLibSql } from "@prisma/adapter-libsql/web"
import path from "path"

const getDbUrl = () => process.env.DATABASE_URL || `file:${path.resolve(__dirname, "../dev.db")}`

let prisma: PrismaClient

export const getPrisma = () => {
  if (!prisma) {
    const dbUrl = getDbUrl()
    console.log("[DB] Connecting to:", dbUrl)
    const adapter = new PrismaLibSql({ url: dbUrl, authToken: process.env.DB_AUTH_TOKEN })
    prisma = new PrismaClient({ adapter })
  }
  return prisma
}