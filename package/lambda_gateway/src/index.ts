import { App, AwsLambdaReceiver } from "@slack/bolt";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
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

const getSlackBotUserToken = async (ssmClient: SSMClient) => {
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
const slackBotUserToken = await getSlackBotUserToken(ssmClient);

// Slack bot config
const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: slackSigningSecret,
});

const app = new App({
  token: slackBotUserToken,
  receiver: awsLambdaReceiver,
});

app.event("app_mention", async ({ event, client, say }) => {
  try {
    // If the message is top of the thread, you can get timestamp as event.thread_ts.
    // If not, you can get as event.ts.
    const threadTs = event.thread_ts || event.ts;

    // We have to return response to Slack within 3 seconds.
    // However ChatGPT API sometimes take more than 3 seconds.
    // Therefore, we send the quick response as soon as a message is received,
    // and send ChatGPT response async by using another Lambda function.
    const resSay = await say({
      text: "Wait a moment ...",
      thread_ts: threadTs,
    });

    // NOTE: In the document, Slack offers as to use Bot user token when we use this api in public/private channel.
    // > To use conversations.replies with public or private channel threads, use a user token
    // https://api.slack.com/methods/conversations.replies
    // However we can somehow use this api by using Bot user token.
    const replies = await client.conversations.replies({
      channel: event.channel,
      ts: threadTs,
    });

    const lambdaClient = new LambdaClient({});
    await lambdaClient.send(
      new InvokeCommand({
        FunctionName: process.env.CHAT_GPT_LAMBDA_ARN,
        InvocationType: "Event",
        Payload: Buffer.from(
          JSON.stringify({
            thread_ts: threadTs,
            thread_messages: replies,
            wait_a_moment_ts: resSay.message?.ts,
          })
        ),
      })
    );
  } catch (error) {
    console.log(error);
    await say("Sorry something went wrong.");
  }
});

export const handler: APIGatewayProxyHandler = async (
  event,
  context,
  callback
) => {
  console.log(JSON.parse(event.body!));
  const awsLambdaReceiverHandler = await awsLambdaReceiver.start();
  return awsLambdaReceiverHandler(event, context, callback);
};
