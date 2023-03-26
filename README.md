# README
Minimum example of Slack chat bot using GPT.

## Installation
### Deploy AWS resources
```sh
make deploy-with-build
```

This command uses terraform internally.

### Create Slack app
You can use the app manifest below.
NOTE: Don't forget to replace `settings.event_subscriptions.request_url` to your API Gateway's address.

```yaml
display_information:
  name: ChatGPT
features:
  bot_user:
    display_name: ChatGPT
    always_online: false
oauth_config:
  scopes:
    bot:
      - app_mentions:read
      - chat:write
      - channels:history
settings:
  event_subscriptions:
    request_url: https://XXXXXXXX.execute-api.ap-northeast-1.amazonaws.com/main/slack
    bot_events:
      - app_mention
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false

```

### Register secrets to SSM Parameter Store

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
