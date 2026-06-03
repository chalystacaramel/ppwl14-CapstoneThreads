// apps/backend/src/config.ts
import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";

const ssm = new SSMClient({ region: "us-east-1" });

const SSM_PARAMS = [
  "/monorepo/DATABASE_URL",
  "/monorepo/JWT_SECRET",
  "/monorepo/API_KEY",
  "/monorepo/FRONTEND_URL",
];

let isLoaded = false;

export const loadConfig = async () => {
  if (isLoaded) return;

  try {
    const command = new GetParametersCommand({
      Names: SSM_PARAMS,
      WithDecryption: true,
    });

    const response = await ssm.send(command);

    if (response.InvalidParameters?.length) {
      console.warn("[CONFIG] Invalid SSM params:", response.InvalidParameters);
    }

    response.Parameters?.forEach((param) => {
      if (!param.Name || !param.Value) return;
      const key = param.Name.split("/").pop()!;
      // Don't overwrite if already set via Lambda env vars
      if (!process.env[key]) {
        process.env[key] = param.Value;
      }
      console.log(
        `[CONFIG] ${key} =`,
        key.includes("SECRET") || key.includes("PASSWORD") || key.includes("TOKEN") || key.includes("URL")
          ? "***"
          : process.env[key]
      );
    });
  } catch (err) {
    console.error("[CONFIG] SSM load failed:", err);
  }

  isLoaded = true;
};