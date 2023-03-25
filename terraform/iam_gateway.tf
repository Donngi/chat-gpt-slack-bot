resource "aws_iam_role" "lambda_gateway" {
  name = "chat-gpt-slack-bot-lambda-gateway-role"

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

resource "aws_iam_policy" "lambda_gateway" {
  name = "${aws_iam_role.lambda_gateway.name}-policy"

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
          data.aws_ssm_parameter.user_token.arn,
          data.aws_ssm_parameter.signing_secret.arn,
        ],
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "name" {
  role       = aws_iam_role.lambda_gateway.name
  policy_arn = aws_iam_policy.lambda_gateway.arn
}

resource "aws_iam_role_policy_attachment" "lambda_gateway_basic_execution" {
  role       = aws_iam_role.lambda_gateway.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
