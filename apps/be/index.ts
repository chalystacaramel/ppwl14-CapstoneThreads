import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

const dummyComments = [
  {
    id: "c1",
    content: "Wah keren banget ini!",
    createdAt: new Date().toISOString(),
    author: { id: "u2", name: "Adhelia" },
    postId: "1",
  },
  {
    id: "c2",
    content: "Semangat timnya!",
    createdAt: new Date().toISOString(),
    author: { id: "u4", name: "Iqlima" },
    postId: "1",
  },
  {
    id: "c3",
    content: "Threads clone kita keren!",
    createdAt: new Date().toISOString(),
    author: { id: "u3", name: "Andy" },
    postId: "1",
  },
];

const app = new Elysia()
  .use(cors())
  .get("/", () => "Threads Clone API is running!")
  .get("/comments/:postId", ({ params }) => {
    const filtered = dummyComments.filter(c => c.postId === params.postId);
    return { data: filtered };
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);