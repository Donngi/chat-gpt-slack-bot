import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

export const getSlackBotUserToken = async (ssmClient: SSMClient) => {
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

export const getOpenAIApiKey = async (ssmClient: SSMClient) => {
  const res = await ssmClient.send(
    new GetParameterCommand({
      Name: process.env.SSM_KEY_OPEN_AI_API_KEY,
      WithDecryption: true,
    })
  );

  if (res.Parameter?.Value === undefined) {
    throw new Error("Failed to get a secret from SSM Parameter Store.");
  }

  return res.Parameter.Value;
};
