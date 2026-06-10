const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const connectionModel = require("../model/connectionRequest");
const sendMail = require("./ses_sendMail");

cron.schedule("0 8 * * *", async () => {
  try {
    const yesterday = subDays(new Date(), 2);
    const startOfYesterday = startOfDay(yesterday);
    const endOfYesterday = endOfDay(yesterday);

    const pendingRequests = await connectionModel
      .find({
        status: "interested",
        createdAt: {
          $gte: startOfYesterday,
          $lt: endOfYesterday,
        },
      })
      .populate("fromUserId toUserId");

    const listOfEmails = [...new Set(pendingRequests.map((req) => req.toUserId.email))];

    for (const email of listOfEmails) {
      try {
        const res = await sendMail.run(
          "you have a connection request from" + email,
          "you got connections request from people all over the world, log into the portal to see further.",
        );
      } catch (err) {
        console.log(err);
      }
    }

    console.log("running a task every minute");
  } catch (err) {
    console.log(err);
  }
});
