import { CloudWatchLogsClient, FilterLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";

const cw = new CloudWatchLogsClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: "REDACTED",
    secretAccessKey: "10iW1c2u62VKds9RWZrLIbZxAOIRAdKXyMY3G0pn",
  },
});

cw.send(new FilterLogEventsCommand({
  logGroupName: "/aws/lambda/monorepo-backend-andy",
  startTime: Date.now() - 1000 * 60 * 10,
})).then(res => {
  res.events?.forEach(e => console.log(e.message));
}).catch(console.error);

