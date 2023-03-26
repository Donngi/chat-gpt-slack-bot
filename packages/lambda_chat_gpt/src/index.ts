import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { SSMClient } from "@aws-sdk/client-ssm";
import { WebClient } from "@slack/web-api";
import { getOpenAIApiKey, getSlackBotUserToken } from "./secrets";

type Props = {
  thread_ts: string;
  thread_messages: ChatCompletionRequestMessage[];
  channel: string;
  wait_a_moment_ts: string;
};

const ssmClient = new SSMClient({});

const slackBotUserToken = await getSlackBotUserToken(ssmClient);
const OpenAIApiKey = await getOpenAIApiKey(ssmClient);

export const handler = async (event: Props) => {
  try {
    const openai = new OpenAIApi(
      new Configuration({
        apiKey: OpenAIApiKey,
      })
    );

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        // Add your prompt here.
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        ...event.thread_messages,
      ],
    });

    const client = new WebClient(slackBotUserToken);
    await client.chat.update({
      channel: event.channel,
      ts: event.wait_a_moment_ts,
      text:
        response.data.choices[0].message?.content ||
        "Sorry something went wrong.",
      as_user: true,
    });
  } catch (error) {
    console.log(error);

    const client = new WebClient(slackBotUserToken);
    await client.chat.update({
      channel: event.channel,
      ts: event.wait_a_moment_ts,
      text: "Sorry something went wrong.",
      as_user: true,
    });
  }
};
