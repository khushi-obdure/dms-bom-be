import { cleanEnv, email, host, port, str } from 'envalid';

function validateEnv() {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    DB_HOST: host(),
    DB_PORT: port(),
    DB_USER: str(),
    DB_PASSWORD: str(),
    DB_DATABASE: str(),
    SECRET_KEY: str(),
    LOG_FORMAT: str(),
    LOG_DIR: str(),
    ORIGIN: str(),

    MAIL_FROM: str(),
    MAIL_USERNAME: str(),
    MAIL_PASSWORD: str(), 
   
    AWS_S3_URL: str(),
    AWS_REGION: str(),
  });
}

export default validateEnv;
