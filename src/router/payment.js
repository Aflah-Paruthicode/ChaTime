const express = require("express");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const { userAuth } = require("../middlewares/auth");
const Payment = require("../model/payment");
const { premiumAmount } = require("../utils/constants");

paymentRouter.post("/create", userAuth, async (req, res) => {
  try {
    const { firstName, lastName } = req.user;
    const { membershipType } = req.body;

    const order = await razorpayInstance.orders.create({
      amount: premiumAmount[membershipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        membershipType,
      },
    });

    const payment = Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    console.log(order);

    res.json({ ...savedPayment.toJSON(),keyId : process.env.RAZORPAY_API_KEY });
  } catch (err) {
    res.status(500).send("Error in creating order -" + err.message);
  }
});

module.exports = paymentRouter;
