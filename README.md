# ppwl14-CapstoneThreads

**Class A / Team 1**
**Main Web:** https://www.threads.net

## 📄 Dokumen
- [Dokumen PPWL TEAM 1 CLONE THREADS - Google Docs](https://docs.google.com/document/d/1F0-oigb74NtKCum7WHZKPEOZBSMQ88rckOREho5bpis/edit?tab=t.cdm5lks88t9d)

## 🔗 Link Deploy
- **Frontend (S3):** http://s3-monorepo-frontend-pro.s3-website-us-east-1.amazonaws.com
- **Frontend :** https://www.ppwl11.store
- **Backend (Lambda):** https://ut2tmtdfxdfe6dmg6hkykhfkwy0vqxoa.lambda-url.us-east-1.on.aws

## 👥 Pembagian Jobdesk

| Name | NIM | Reference Page | Specific Component |
|---|---|---|---|
| Aisyah | H1101241044 | https://www.threads.net | Navbar.tsx, Feed.tsx, ThreadCard.tsx |
| Chalysta Setyani | H1101241003 | https://www.threads.net/@threads | DetailPost.tsx, CommentCard.tsx, CommentReply.tsx |
| Adhelia Issabel | H1101241001 | https://www.threads.net/login | LoginPage.tsx, RegisterPage.tsx, AuthForm.tsx |
| Andy Emerik | H1101241045 | https://www.threads.net/login | FormPost.tsx, ImageUpload.tsx |
| Iqlima Nur'Ain | H1101241007 | https://www.threads.net/activity | NotifPage.tsx, NotifItem.tsx, EditProfile.tsx |

## 🛠️ Tech Stack
- **FE:** Vite + React + TypeScript + Tailwind v4 + ShadcnUI
- **BE:** ElysiaJS + Prisma
- **DB:** SQLite (dev) / AWS RDS PostgreSQL (production)
- **Deploy:** AWS Lambda (BE) + AWS S3/CloudFront (FE)

## 🚀 Cara Menjalankan

### Install dependencies
```bash
bun install
```

### Jalankan Backend
```bash
cd apps/backend
bun run src/server.ts
```

### Jalankan Frontend
```bash
cd apps/frontend
bun dev
```

## build backend
```sh
bun add @aws-sdk/client-ssm @prisma/adapter-pg @elysiajs/jwt
bun prisma generate --schema prisma/schema-postgres.prisma
bun build src/lambda.ts --outdir dist-lambda --target node --format cjs --external prisma
if not exist cert mkdir cert && curl -o cert/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
if not exist "dist-lambda\cert" mkdir "dist-lambda\cert" && xcopy /y "cert\global-bundle.pem" "dist-lambda\cert\"
xcopy /s /i /e src\generated\prisma-pg dist-lambda\generated\prisma-pg
cd dist-lambda && powershell -NoProfile -Command "Compress-Archive -Path * -DestinationPath ../lambda-backend.zip -Force" && cd ..
aws lambda update-function-code --function-name monorepo-backend --zip-file fileb://lambda-backend.zip
aws lambda update-function-configuration --function-name monorepo-backend --environment "Variables={NODE_ENV=production}"
# cek di logs
aws logs tail /aws/lambda/monorepo-backend --follow
```

## tools
```sh
# hapus node_modules secara recursive
FOR /R %i IN (node_modules) DO IF EXIST "%i" rmdir /s /q "%i"
```