const express = require("express");
const validate = require("../middlewares/validate");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

router.post(
  "/stripe/create",
  validate(paymentController.createStripePaymentSchema),
  paymentController.createStripePayment
);

router.post(
  "/create",
  validate(paymentController.createPaymentSchema),
  paymentController.createPayment
);

router.get("/:id", paymentController.getPaymentById);

router.post(
  "/webhook",
  validate(paymentController.webhookSchema),
  paymentController.handleWebhook
);

module.exports = router;