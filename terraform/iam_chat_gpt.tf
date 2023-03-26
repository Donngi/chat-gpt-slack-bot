resource "aws_iam_role" "lambda_chat_gpt" {
  name = "chat-gpt-slack-bot-lambda-chat-gpt-role"

  assume_role_policy = jsonencode(
    {
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Action" : "sts:AssumeRole",
          "Principal" : {
            "Service" : "lambda.amazonaws.com"
          },
          "Effect" : "Allow",
        }
      ]
    }
  )
}

resource "aws_iam_policy" "lambda_chat_gpt" {
  name = "${aws_iam_role.lambda_chat_gpt.name}-policy"

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "ssm:GetParameter",
        ],
        "Resource" : [
          data.aws_ssm_parameter.chat_gpt_api_key.arn,
          data.aws_ssm_parameter.bot_user_token.arn,
        ],
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_chat_gpt" {
  role       = aws_iam_role.lambda_chat_gpt.name
  policy_arn = aws_iam_policy.lambda_chat_gpt.arn
}

resource "aws_iam_role_policy_attachment" "lambda_chat_gpt_basic_execution" {
  role       = aws_iam_role.lambda_chat_gpt.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
