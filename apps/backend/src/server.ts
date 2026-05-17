import { createApp } from "./index";
import { getPrisma } from "../prisma/db";
import cors from "@elysiajs/cors";

const app = createApp(getPrisma);
app.use(cors({
  origin: "*",
  allowedHeaders: ["Content-Type", "Authorization"],
}))
.listen(3000);

console.log("🦊 Backend → http://localhost:3000");