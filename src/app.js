const express = require("express");
const pinoHttp = require("pino-http");
const logger = require("./utils/logger");

const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const notFoundHandler = require("./middlewares/notFoundHandler");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());

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

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "secure-payment-backend-demo",
  });
});

app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;