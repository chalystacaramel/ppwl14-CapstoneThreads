import { PrismaClient } from "../src/generated/prisma/client.ts"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import path from "path"

export const dbUrl = process.env.DATABASE_URL || `file:${path.resolve(__dirname, "../dev.db")}`

<<<<<<< HEAD
const adapter = new PrismaLibSql({ url: dbUrl, authToken: process.env.DB_AUTH_TOKEN })
=======
const adapter = new PrismaLibSql({ url: dbUrl, authToken: process.env.DB_AUTH_TOKEN ?? "" })
>>>>>>> 7397ce46e8b8638c965fbbf288adb3afa417592f

let prisma: PrismaClient

export const getPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient({ adapter })
  }
  return prisma
}