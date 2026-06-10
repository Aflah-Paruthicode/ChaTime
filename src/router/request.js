const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../model/connectionRequest");
const requestRouter = express.Router();
const User = require("../model/user");
const sendMail = require("../utils/ses_sendMail");

requestRouter.post("/send/:toUserId/:status", userAuth, async (req, res) => {
  const fromUserId = req.user._id;
  const { toUserId, status } = req.params;

  try {
    if (fromUserId == toUserId) throw new Error("Cannot send request to yourself");

    const toUser = await User.findOne({ _id: toUserId });
    if (!toUser) return res.status(400).json({ message: "user not found !" });

    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingConnectionRequest) return res.status(400).send("Connection Request already present : " + existingConnectionRequest);

    const allowedStatus = ["ignored", "interested"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "invalid status type + ", status });
    }

    const request = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    const data = await request.save();
    const resEmail = await sendMail.run(
      "A new connection request from " + req.user.firstName + " " + req.user.lastName,
      req.user.firstName + " " + req.user.lastName + " sent the connection request to " + toUser.firstName + " " + toUser.lastName,
    );
    console.log(resEmail);

    res.send(req.user.firstName + " " + req.user.lastName + " sent the connection request to " + toUser.firstName + " " + toUser.lastName + data);
  } catch (err) {
    res.status(200).send("Error in request send - " + err.message);
  }
});

requestRouter.post("/review/:requestId/:status", userAuth, async (req, res) => {
  const loggedInUser = req.user;
  const { requestId, status } = req.params;

  try {
    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) res.status(400).json({ message: "Status not allowed" });

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested",
    });

    if (!connectionRequest) res.status(404).json({ message: "Request not found" });

    connectionRequest.status = status;

    const data = await connectionRequest.save();
    res.status(200).json({ message: "Connection request " + status, data });
  } catch (err) {
    res.status(400).send("Error in request review - " + err.message);
  }
});

module.exports = requestRouter;
