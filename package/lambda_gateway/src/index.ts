import { App, AwsLambdaReceiver } from "@slack/bolt";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { APIGatewayProxyHandler } from "aws-lambda";

// Init - Get secrets from SSM Parameter Store.
const ssmClient = new SSMClient({});

const getSlackSigningSecret = async (ssmClient: SSMClient) => {
  const res = await ssmClient.send(
    new GetParameterCommand({
      Name: process.env.SSM_KEY_SLACK_SIGNING_SECRET,
      WithDecryption: true,
    })
  );

  if (res.Parameter?.Value === undefined) {
    throw new Error("Failed to get a secret from SSM Parameter Store.");
  }

  return res.Parameter.Value;
};
const slackSigningSecret = await getSlackSigningSecret(ssmClient);

const getSlackUserToken = async (ssmClient: SSMClient) => {
  const res = await ssmClient.send(
    new GetParameterCommand({
      Name: process.env.SSM_KEY_SLACK_USER_TOKEN,
      WithDecryption: true,
    })
  );

  if (res.Parameter?.Value === undefined) {
    throw new Error("Failed to get a secret from SSM Parameter Store.");
  }

  return res.Parameter.Value;
};
const slackBotToken = await getSlackUserToken(ssmClient);

// Slack bot config
const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: slackSigningSecret,
});

const app = new App({
  token: slackBotToken,
  receiver: awsLambdaReceiver,
});

app.event("app_mention", async ({ event, client, say }) => {
  const threadTs = event.thread_ts ? event.thread_ts : event.ts;

  // https://api.slack.com/methods/conversations.replies

  await say("hoge");
});

export const handler: APIGatewayProxyHandler = async (
  event,
  context,
  callback
) => {
  const awsLambdaReceiverHandler = await awsLambdaReceiver.start();
  return awsLambdaReceiverHandler(event, context, callback);
};
