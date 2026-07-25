const express = require("express");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const { userAuth } = require("../middlewares/auth");
const Payment = require("../model/payment");
const { premiumAmount } = require("../utils/constants");
const { validateWebhookSignature } = require("razorpay/dist/utils/razorpay-utils");

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

    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_API_KEY });
  } catch (err) {
    res.status(500).send("Error in creating order -" + err.message);
  }
});

paymentRouter.post("/webhooks", userAuth, async (req, res) => {
  try {
    const webhookSignature = req.get["X-Razorpay-Signature"];
    const isWebhookValid = validateWebhookSignature(JSON.stringify(req.body), webhookSignature, process.env.RAZORPAY_WEBHOOK_SECRET);

    if(!isWebhookValid) {
      return res.status(400).json({message : "Webhook signature invalid"});  
    }

    const paymentDetails = req.body.payload.payment.entity; 
    const payment = Payment.findOne({orderId: paymentDetails.order_id}); 
    payment.status = paymentDetails.status; 
    await payment.save();    

    // req.body.event == "payment.captured"
    // req.body.event == "payment.failed"

    return res.status(200).json({message:"Webhook recieved successfully"})

  } catch (err) {
    return res.status(500).json({message:err.message});  
  }
});

module.exports = paymentRouter;
