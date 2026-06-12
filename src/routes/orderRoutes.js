const express = require("express");
const validate = require("../middlewares/validate");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.post(
  "/",
  validate(orderController.createOrderSchema),
  orderController.createOrder
);

router.get("/:id", orderController.getOrderById);

module.exports = router;