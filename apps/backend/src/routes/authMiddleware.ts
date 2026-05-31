import { Elysia, t } from "elysia";
import { jwtConfig } from "../lib/jwt";

export const authMiddleware = new Elysia()
    .use(jwtConfig)
    // Guard untuk memvalidasi struktur header secara ketat di awal
    .guard({
        headers: t.Object({
            authorization: t.TemplateLiteral('Bearer ${string}')
        })
    })
    // Resolve untuk mengolah token, memverifikasi JWT, dan menyuntikkan data ke rute
    .resolve({ as: 'global' }, async ({ headers: { authorization }, jwt, set }) => {
        if (!authorization) {
            set.status = 401;
            throw new Error("Perlu ada Token");
        }
        const token = authorization!.split(' ')[1];
        const payload = await jwt.verify(token);

        if (!payload) {
            set.status = 401;
            throw new Error("Token tidak valid");
        }

        // Semua properti yang di-return di sini akan otomatis tersedia di rute bawahnya
        return {
            bearer: token,
            user: payload // Sekarang rute kamu punya akses ke data { id, email, name }
        };
    });