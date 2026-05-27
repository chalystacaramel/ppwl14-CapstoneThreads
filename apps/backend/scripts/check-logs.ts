import { CloudWatchLogsClient, FilterLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";

const cw = new CloudWatchLogsClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

cw.send(new FilterLogEventsCommand({
  logGroupName: "/aws/lambda/monorepo-backend-andy",
  startTime: Date.now() - 1000 * 60 * 10,
})).then(res => {
  res.events?.forEach(e => console.log(e.message));
}).catch(console.error);

