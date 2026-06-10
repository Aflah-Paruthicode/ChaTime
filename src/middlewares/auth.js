const jwt = require("jsonwebtoken");
const User = require("../model/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(401).send("Please login!");

    const decodedObj = await jwt.verify(token, "DEV@CHATIME$790");

    const { _id } = decodedObj;

    const user = await User.findById({ _id: _id });

    console.log(user);
    if (!user) throw new Error("User not found");
    req.user = user;
    next();
  } catch (err) {
    return res.status(400).send("Error In Auth - " + err.message);
  }
};

module.exports = {
  userAuth,
};
