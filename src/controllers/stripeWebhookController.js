const stripe = require("../config/stripe");
const paymentService = require("../services/paymentService");
const logger = require("../utils/logger");

async function handleStripeWebhook(req, res) {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    logger.error({
      event: "stripe_webhook_signature_failed",
      message: error.message,
    });

    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;

        await paymentService.handleStripePaymentIntentWebhook({
          eventId: event.id,
          eventType: event.type,
          paymentIntent,
          status: "paid",
          rawPayload: event,
        });

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;

        await paymentService.handleStripePaymentIntentWebhook({
          eventId: event.id,
          eventType: event.type,
          paymentIntent,
          status: "failed",
          rawPayload: event,
        });

        break;
      }

      case "payment_intent.processing": {
        const paymentIntent = event.data.object;

        await paymentService.handleStripePaymentIntentWebhook({
          eventId: event.id,
          eventType: event.type,
          paymentIntent,
          status: "processing",
          rawPayload: event,
        });

        break;
      }

      default:
        logger.info({
          event: "stripe_webhook_unhandled_event",
          stripeEventType: event.type,
        });
    }

    return res.json({
      received: true,
    });
  } catch (error) {
    logger.error({
      event: "stripe_webhook_processing_failed",
      stripeEventId: event.id,
      stripeEventType: event.type,
      message: error.message,
    });

    return res.status(500).json({
      message: "Webhook processing failed",
    });
  }
}

module.exports = {
  handleStripeWebhook,
};