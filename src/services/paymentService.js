const crypto = require("crypto");
const pool = require("../config/db");
const logger = require("../utils/logger");

async function createPayment({ orderId, idempotencyKey }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existingPayments] = await connection.execute(
      `SELECT id, order_id, provider, provider_payment_id, amount, status, idempotency_key
       FROM payments
       WHERE idempotency_key = ?
       LIMIT 1`,
      [idempotencyKey]
    );

    if (existingPayments.length > 0) {
      await connection.commit();

      return {
        reused: true,
        payment: existingPayments[0],
      };
    }

    const [orders] = await connection.execute(
      `SELECT id, amount, status
       FROM orders
       WHERE id = ?
       FOR UPDATE`,
      [orderId]
    );

    if (orders.length === 0) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    const order = orders[0];

    if (order.status === "paid") {
      const error = new Error("Order already paid");
      error.statusCode = 409;
      throw error;
    }

    const providerPaymentId = `mock_pay_${crypto.randomUUID()}`;

    const [paymentResult] = await connection.execute(
      `INSERT INTO payments 
       (order_id, provider, provider_payment_id, idempotency_key, amount, status)
       VALUES (?, 'mock_gateway', ?, ?, ?, 'pending')`,
      [orderId, providerPaymentId, idempotencyKey, order.amount]
    );

    await connection.execute(
      `UPDATE orders
       SET status = 'pending_payment'
       WHERE id = ?`,
      [orderId]
    );

    const [payments] = await connection.execute(
      `SELECT id, order_id, provider, provider_payment_id, amount, status, idempotency_key
       FROM payments
       WHERE id = ?`,
      [paymentResult.insertId]
    );

    await connection.commit();

    return {
      reused: false,
      payment: payments[0],
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getPaymentById(paymentId) {
  const [rows] = await pool.execute(
    `SELECT id, order_id, provider, provider_payment_id, amount, status, idempotency_key, created_at, updated_at
     FROM payments
     WHERE id = ?`,
    [paymentId]
  );

  return rows[0] || null;
}

async function handleWebhook({ eventId, eventType, providerPaymentId, status, rawPayload }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existingEvents] = await connection.execute(
      `SELECT id FROM payment_events WHERE event_id = ? LIMIT 1`,
      [eventId]
    );

    if (existingEvents.length > 0) {
      await connection.commit();

      return {
        duplicated: true,
        message: "Webhook event already processed",
      };
    }

    const [payments] = await connection.execute(
      `SELECT id, order_id, status
       FROM payments
       WHERE provider_payment_id = ?
       FOR UPDATE`,
      [providerPaymentId]
    );

    if (payments.length === 0) {
      const error = new Error("Payment not found for webhook");
      error.statusCode = 404;
      throw error;
    }

    const payment = payments[0];

    await connection.execute(
      `INSERT INTO payment_events (payment_id, event_id, event_type, status, payload)
       VALUES (?, ?, ?, ?, ?)`,
      [payment.id, eventId, eventType, status, JSON.stringify(rawPayload)]
    );

    if (status === "paid") {
      await connection.execute(
        `UPDATE payments SET status = 'paid' WHERE id = ?`,
        [payment.id]
      );

      await connection.execute(
        `UPDATE orders SET status = 'paid' WHERE id = ?`,
        [payment.order_id]
      );
    }

    if (status === "failed") {
      await connection.execute(
        `UPDATE payments SET status = 'failed' WHERE id = ?`,
        [payment.id]
      );

      await connection.execute(
        `UPDATE orders SET status = 'cancelled' WHERE id = ?`,
        [payment.order_id]
      );
    }

    await connection.commit();

    logger.info({
      event: "payment_webhook_processed",
      paymentId: payment.id,
      orderId: payment.order_id,
      status,
    });

    return {
      duplicated: false,
      message: "Webhook processed successfully",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createPayment,
  getPaymentById,
  handleWebhook,
};