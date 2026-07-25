import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getDatabaseSecret() {
  const command = new GetSecretValueCommand({
    SecretId: process.env.SECRET_NAME,
  });

  const response = await client.send(command);

  return JSON.parse(response.SecretString!);
}