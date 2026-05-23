import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

const sts = new STSClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: "REDACTED",
    secretAccessKey: "10iW1c2u62VKds9RWZrLIbZxAOIRAdKXyMY3G0pn",
  },
});

sts.send(new GetCallerIdentityCommand({})).then(console.log).catch(console.error);

