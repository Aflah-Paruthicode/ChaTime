const express = require("express");
const { connectDb } = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRouter = require("./router/auth");
const proffileRouter = require("./router/proffile");
const requestRouter = require("./router/request");
const userRouter = require("./router/user");
const paymentRouter = require("./router/payment");

require("./utils/cron_jobs");

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/profile", proffileRouter);
app.use("/request", requestRouter);
app.use("/user", userRouter);
app.use("/payment", paymentRouter);

connectDb()
  .then(() => {
    console.log("Database connection is did");
    app.listen(8080, () => {
      console.log("Server Started");
    });
  })
  .catch((err) => console.error("Got a db error"));
