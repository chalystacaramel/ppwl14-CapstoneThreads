import { LambdaClient, ListFunctionsCommand } from "@aws-sdk/client-lambda";

const lambda = new LambdaClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

lambda.send(new ListFunctionsCommand({})).then(res => {
  console.log("Functions:");
  res.Functions?.forEach(f => console.log(f.FunctionName));
}).catch(console.error);


