const express = require("express");
const path = require("path");
const pinoHttp = require("pino-http");
const logger = require("./utils/logger");

const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const stripeWebhookController = require("./controllers/stripeWebhookController");

const notFoundHandler = require("./middlewares/notFoundHandler");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(
  pinoHttp({
    logger,
    customProps: function (req) {
      return {
        requestId: req.id,
      };
    },
  })
);

app.post(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookController.handleStripeWebhook
);

app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "secure-payment-backend-demo",
  });
});

app.get("/api/config", (req, res) => {
  res.json({
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;