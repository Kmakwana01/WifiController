import dotenv from 'dotenv';
dotenv.config()

const REFRESH_TOKEN_EXPIRE_IN_DAY = process.env.REFRESH_TOKEN_EXPIRE_IN_DAY;
const ACCESS_TOKEN_EXPIRE_IN_DAY = process.env.ACCESS_TOKEN_EXPIRE_IN_DAY;
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const NODEMAILER_PASSKEY = process.env.NODEMAILER_PASSKEY;
const ISSUER_ID = process.env.ISSUER_ID;
const KEY_ID = process.env.KEY_ID;
const APP_BUNDLE_ID = process.env.APP_BUNDLE_ID;
const APPLE_PASSWORD = process.env.APPLE_PASSWORD;
// const SOCKET_PORT = process.env.SOCKET_PORT;

const constantsObj : any = {
  REFRESH_TOKEN_EXPIRE_IN_DAY,
  ACCESS_TOKEN_EXPIRE_IN_DAY,
  PORT,
  MONGO_URL,
  NODEMAILER_PASSKEY,
  ISSUER_ID,
  KEY_ID,
  APP_BUNDLE_ID,
  APPLE_PASSWORD
};

export const constants = Object.freeze(constantsObj);