const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditProffile, validateCurrPassword, validNewPassword } = require("../utils/validation");
const proffileRouter = express.Router();

proffileRouter.get("/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (user.length !== 0) {
      res.send(user);
    } else {
      res.status(404).send("User Not Found");
    }
  } catch (err) {
    res.status(404).send("something went wrong " + err.message);
  }
});

proffileRouter.post("/edit", userAuth, async (req, res) => {
  console.log("heey");
  try {
    if (!validateEditProffile(req)) return res.status(401).send("Invalid edit request");
    console.log("yesssssss yea");
    let loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.json({ message: "Proffile update successfull", data: loggedInUser });
  } catch (err) {
    res.status(400).send("Error in update proffile - " + err.message);
  }
});

proffileRouter.patch("/password", userAuth, async (req, res) => {
  try {
    if (!(await validateCurrPassword(req))) throw new Error("invalid password");
    if (!(await validNewPassword(req))) throw new Error("The new Password is not strong");

    const loggedInUser = req.user;
    loggedInUser.save();
    res.status(200).send("password update successfull");
  } catch (err) {
    res.status(400).send("Error in edit password - " + err.message);
  }
});

module.exports = proffileRouter;
