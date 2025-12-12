import express from "express";
import { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import config from "./config";
import router from "./app/routes";
import cookieParser from "cookie-parser";
import { PaymentController } from "./app/modules/payment/payment.controller";

const app: Application = express();
app.use(cookieParser());

// test comment
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent
);
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://travel-buddy-client-taupe.vercel.app",
    ],
    credentials: true,
  })
);

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Server is running...",
    environment: config.node_env,
    uptime: process.uptime().toFixed(2) + " sec",
    timeStamp: new Date().toISOString(),
  });
});

app.use("/api/v1", router);
app.use(globalErrorHandler);

app.use(notFound);

export default app;
