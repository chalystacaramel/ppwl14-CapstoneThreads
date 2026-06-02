import { createApp } from "./index";
import { getPrisma, dbUrl } from "../prisma/db"; // LibSQL

const app = createApp(getPrisma);

app.listen(3000);

console.log("🦊 Backend    → http://localhost:3000");
console.log("🦊 FRONTEND_URL →", process.env.FRONTEND_URL);
console.log("🦊 DATABASE_URL →", dbUrl);