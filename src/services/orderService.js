const pool = require("../config/db");

async function createOrder({ customerName, amount }) {
  const [result] = await pool.execute(
    `INSERT INTO orders (customer_name, amount, status)
     VALUES (?, ?, 'created')`,
    [customerName, amount]
  );

  const [rows] = await pool.execute(
    `SELECT id, customer_name, amount, status, created_at
     FROM orders
     WHERE id = ?`,
    [result.insertId]
  );

  return rows[0];
}

async function getOrderById(orderId) {
  const [rows] = await pool.execute(
    `SELECT id, customer_name, amount, status, created_at, updated_at
     FROM orders
     WHERE id = ?`,
    [orderId]
  );

  return rows[0] || null;
}

module.exports = {
  createOrder,
  getOrderById,
};