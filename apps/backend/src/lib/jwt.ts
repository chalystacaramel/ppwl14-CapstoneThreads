// di pakai beberapa sub routes (auth, data(post yg verifikasi user id))
import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';

// Membuat plugin jwtConfig yang bisa di-use oleh instance Elysia lain
export const jwtConfig = new Elysia({ name: 'jwt-config' })
    .use(
        jwt({
            name: "jwt",
            secret: process.env.JWT_SECRET || "dev",
            exp: "1d", // jika tidak diberikan, jwt infinite (tidak dapat kadaluarsa)
            schema: t.Object({ // agar typescript tau isinya ketika di panggil
                id: t.Number(),
                name: t.String(),
                email: t.String(),
            })
        })
    );