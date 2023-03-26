# README

Register your slack tokens to SSM Parameter Store

**Slack User Token**

```sh
aws ssm put-parameter --name /chat-gpt-slack-bot/user-token --value xoxp-XXXXXXXX --type SecureString
```

**Slack Signing Secret**

```sh
aws ssm put-parameter --name /chat-gpt-slack-bot/signing-secret --value xoxp-XXXXXXXX --type SecureString
```
