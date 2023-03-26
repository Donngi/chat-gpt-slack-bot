# README

Register secrets to SSM Parameter Store

**Slack User Token**

```sh
aws ssm put-parameter --name /chat-gpt-slack-bot/bot-user-token --value xoxb-XXXXXXXX --type SecureString
```

**Slack Signing Secret**

```sh
aws ssm put-parameter --name /chat-gpt-slack-bot/signing-secret --value XXXXXXXX --type SecureString
```

**OpenAI API Key**

```sh
aws ssm put-parameter --name /chat-gpt-slack-bot/open-ai-api-key --value XXXXXXXX --type SecureString
```
