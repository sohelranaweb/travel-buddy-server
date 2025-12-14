import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,

  salt_round: process.env.SALT_ROUND,
  jwt: {
    acc_secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    acc_expires: process.env.JWT_ACCESS_TOKEN_EXPIRES,
    refresh_secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    refresh_expires: process.env.JWT_REFRESH_TOKEN_EXPIRES,
    reset_pass_secret: process.env.RESET_PASS_TOKEN,
    reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
  },
  cloudinary: {
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
  },
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecretKey: process.env.STRIPE_WEBHOOK_SECRET_KEY,
  payment: {
    payment_success_url: process.env.PAYMENT_SUCCESS_LINK,
    payment_failed_url: process.env.PAYMENT_FAILED_LINK,
  },
};
