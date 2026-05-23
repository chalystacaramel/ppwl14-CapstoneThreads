import { LambdaClient, GetFunctionConfigurationCommand } from "@aws-sdk/client-lambda";

const lambda = new LambdaClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: "REDACTED",
    secretAccessKey: "10iW1c2u62VKds9RWZrLIbZxAOIRAdKXyMY3G0pn",
  },
});

lambda.send(new GetFunctionConfigurationCommand({
  FunctionName: "monorepo-backend-andy"
})).then(res => {
  console.log("Runtime:", res.Runtime);
  console.log("Handler:", res.Handler);
  console.log("Layers:", res.Layers);
}).catch(console.error);

