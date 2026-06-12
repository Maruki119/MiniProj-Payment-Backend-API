const { z } = require("zod");
const orderService = require("../services/orderService");

const createOrderSchema = z.object({
  body: z.object({
    customerName: z.string().min(1),
    amount: z.number().positive(),
  }),
});

async function createOrder(req, res, next) {
  try {
    const order = await orderService.createOrder(req.validated.body);

    return res.status(201).json({
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId)) {
      return res.status(400).json({
        message: "Invalid order id",
      });
    }

    const order = await orderService.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.json({
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrderSchema,
  createOrder,
  getOrderById,
};