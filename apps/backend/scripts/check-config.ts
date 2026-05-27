import { LambdaClient, GetFunctionConfigurationCommand } from "@aws-sdk/client-lambda";

const lambda = new LambdaClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

lambda.send(new GetFunctionConfigurationCommand({
  FunctionName: "monorepo-backend-andy"
})).then(res => {
  console.log("Runtime:", res.Runtime);
  console.log("Handler:", res.Handler);
  console.log("Layers:", res.Layers);
}).catch(console.error);

