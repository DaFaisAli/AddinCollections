const express = require("express");
const jwt = require("jsonwebtoken");
const Order = require("../models/order");

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

// Middleware to check token
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });

    req.userId = decoded.id;
    next();
  });
}

// GET USER'S ORDERS
router.get("/", auth, async (req, res) => {
  const orders = await Order.find({ userId: req.userId });
  res.json(orders);
});

// OPTIONAL: Create a new order (for your cart/checkout later)
router.post("/", auth, async (req, res) => {
  const order = new Order({
    userId: req.userId,
    product: req.body.product,
    status: "Processing"
  });

  await order.save();
  res.json(order);
});

module.exports = router;