import "dotenv/config"
import { createApp } from "./index";
import { getPrisma, getDbUrl } from "../prisma/db";
import cors from "@elysiajs/cors";

const app = createApp(getPrisma);

app.use(cors({
  origin: "*",
  allowedHeaders: ["Content-Type", "Authorization"],
}))
.listen(3000);

console.log("🦊 Backend    → http://localhost:3000");
console.log("🦊 FRONTEND_URL →", process.env.FRONTEND_URL);
console.log("🦊 DATABASE_URL →", getDbUrl());
console.log("🦊 REDIRECT_URI →", process.env.GOOGLE_REDIRECT_URI);