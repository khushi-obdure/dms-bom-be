import { config } from 'dotenv';
// config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });
config({ path: `.env.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const {
  NODE_ENV,
  PORT,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
  SECRET_KEY,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,

  MAIL_FROM,
  MAIL_USERNAME,
  MAIL_PASSWORD,

  AWS_S3_URL,
  AWS_REGION,

  DRIVE_FOLDER_ID
} = process.env;
