const { z } = require("zod");
const paymentService = require("../services/paymentService");
const { verifySignature } = require("../utils/signature");

const createStripePaymentSchema = z.object({
  body: z.object({
    orderId: z.number().int().positive(),
    idempotencyKey: z.string().min(10),
  }),
});

const createPaymentSchema = z.object({
  body: z.object({
    orderId: z.number().int().positive(),
    idempotencyKey: z.string().min(10),
  }),
});

const webhookSchema = z.object({
  body: z.object({
    eventId: z.string().min(1),
    eventType: z.string().min(1),
    providerPaymentId: z.string().min(1),
    status: z.enum(["paid", "failed"]),
  }),
  headers: z.object({
    "x-mock-signature": z.string().min(1),
  }).passthrough(),
});

async function createStripePayment(req, res, next) {
  try {
    const result = await paymentService.createStripePayment(req.validated.body);

    return res.status(result.reused ? 200 : 201).json({
      message: result.reused
        ? "Stripe PaymentIntent already created with this idempotency key"
        : "Stripe PaymentIntent created successfully",
      data: result.payment,
      clientSecret: result.clientSecret,
    });
  } catch (error) {
    next(error);
  }
}

async function createPayment(req, res, next) {
  try {
    const result = await paymentService.createPayment(req.validated.body);

    return res.status(result.reused ? 200 : 201).json({
      message: result.reused
        ? "Payment already created with this idempotency key"
        : "Payment created successfully",
      data: result.payment,
    });
  } catch (error) {
    next(error);
  }
}

async function getPaymentById(req, res, next) {
  try {
    const paymentId = Number(req.params.id);

    if (!Number.isInteger(paymentId)) {
      return res.status(400).json({
        message: "Invalid payment id",
      });
    }

    const payment = await paymentService.getPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    return res.json({
      data: payment,
    });
  } catch (error) {
    next(error);
  }
}

async function handleWebhook(req, res, next) {
  try {
    const payload = req.validated.body;
    const signature = req.validated.headers["x-mock-signature"];

    const isValidSignature = verifySignature(
      payload,
      signature,
      process.env.WEBHOOK_SECRET
    );

    if (!isValidSignature) {
      return res.status(401).json({
        message: "Invalid webhook signature",
      });
    }

    const result = await paymentService.handleWebhook({
      eventId: payload.eventId,
      eventType: payload.eventType,
      providerPaymentId: payload.providerPaymentId,
      status: payload.status,
      rawPayload: payload,
    });

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPaymentSchema,
  webhookSchema,
  createPayment,
  getPaymentById,
  handleWebhook,
  createStripePaymentSchema,
  createStripePayment,
};