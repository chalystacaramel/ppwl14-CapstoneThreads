import { PrismaLibSql } from "@prisma/adapter-libsql/web"
import { PrismaClient } from "../src/generated/prisma/client.ts"

export const getDbUrl = () => process.env.DATABASE_URL || "file:./dev.db"

let prisma: PrismaClient

export const getPrisma = () => {
  if (!prisma) {
    const url = getDbUrl()
    const adapter = new PrismaLibSql({
      url,
      authToken: process.env.DB_AUTH_TOKEN,
    })
    prisma = new PrismaClient({ adapter })
  }
  return prisma
}