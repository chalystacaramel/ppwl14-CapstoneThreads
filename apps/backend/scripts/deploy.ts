import { LambdaClient, UpdateFunctionCodeCommand } from "@aws-sdk/client-lambda";
import fs from "fs";

const lambda = new LambdaClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const zipFile = fs.readFileSync("dist-lambda/lambda.zip");

lambda.send(new UpdateFunctionCodeCommand({
  FunctionName: "monorepo-backend-andy",
  ZipFile: zipFile,
})).then(res => {
  console.log("Deployed successfully! LastModified:", res.LastModified);
}).catch(console.error);


