data "aws_ssm_parameter" "chat_gpt_api_key" {
  name = "/chat-gpt-slack-bot/chat-gpt-api-key"
}

data "aws_ssm_parameter" "user_token" {
  name = "/chat-gpt-slack-bot/user-token"
}

data "aws_ssm_parameter" "signing_secret" {
  name = "/chat-gpt-slack-bot/signing-secret"
}
