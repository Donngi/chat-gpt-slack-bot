data "archive_file" "lambda_chat_gpt_src" {
  type        = "zip"
  source_dir  = "../package/lambda_chat_gpt/dist"
  output_path = "lambda_chat_gpt.zip"
}

resource "aws_lambda_function" "chat_gpt" {
  filename      = data.archive_file.lambda_chat_gpt_src.output_path
  function_name = "chat-gpt-slack-bot-chat-gpt-requester"
  role          = aws_iam_role.lambda_chat_gpt.arn
  handler       = "index.handler"

  source_code_hash = data.archive_file.lambda_chat_gpt_src.output_base64sha256

  runtime = "nodejs18.x"

  environment {
    variables = {
      SSM_KEY_OPEN_AI_API_KEY  = data.aws_ssm_parameter.chat_gpt_api_key.name
      SSM_KEY_SLACK_USER_TOKEN = data.aws_ssm_parameter.bot_user_token.name
    }
  }

  timeout = 30
  publish = true
}
