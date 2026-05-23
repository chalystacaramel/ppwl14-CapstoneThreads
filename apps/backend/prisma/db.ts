import { PrismaClient } from "../src/generated/prisma/client.ts"
import { PrismaLibSql } from "@prisma/adapter-libsql/web"
import { createClient } from "@libsql/client/web"

let prisma: PrismaClient

export const getPrisma = () => {
  if (!prisma) {
    const url = process.env.DATABASE_URL!
    const authToken = process.env.DB_AUTH_TOKEN
    const adapter = new PrismaLibSql({ url, authToken })
    prisma = new PrismaClient({ adapter })
  }
  return prisma
}