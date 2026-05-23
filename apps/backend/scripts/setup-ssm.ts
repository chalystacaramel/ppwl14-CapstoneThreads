import { SSMClient, PutParameterCommand } from "@aws-sdk/client-ssm";

const ssm = new SSMClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function main() {
  const params = [
    { Name: "/monorepo/GOOGLE_CLIENT_ID", Value: "REDACTED" },
    { Name: "/monorepo/GOOGLE_CLIENT_SECRET", Value: "REDACTED" },
    { Name: "/monorepo/JWT_SECRET", Value: "supersecret123" },
    { Name: "/monorepo/API_KEY", Value: "myapikey" },
    { Name: "/monorepo/DATABASE_URL", Value: "libsql://monorepo-adheliaissabel.aws-ap-northeast-1.turso.io" },
    { Name: "/monorepo/DB_AUTH_TOKEN", Value: "REDACTED
  ];

  for (const p of params) {
    await ssm.send(new PutParameterCommand({
      Name: p.Name,
      Value: p.Value,
      Type: "SecureString",
      Overwrite: true,
    }));
    console.log(`Uploaded ${p.Name}`);
  }
}

main().catch(console.error);


