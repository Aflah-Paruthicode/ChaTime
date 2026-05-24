const express = require("express");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const {userAuth} = require("../middlewares/auth");

paymentRouter.post("/create", userAuth, async (req, res) => {
  try {
    const order = await razorpayInstance.orders.create({
      amount: 100 * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName: "hey",
        lastName: "bruh",
        membershipType: "silver",
      },
    });

    console.log(order);

    res.json({ order });
  } catch (err) {
    res.status(500).send("Error in creating order -" + err.message);
  }
});

module.exports = paymentRouter;
