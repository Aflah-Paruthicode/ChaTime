const validator = require("validator");
const bcrypt = require("bcrypt");

const validateSignUpData = async (req) => {
  const { firstName, lastName, email, password, about } = req.body;
  if (!firstName.trim()) {
    throw new Error("first name is not valid");
  } else if (!lastName.trim()) {
    throw new Error("last name is not valid");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong");
  }
};

const validateEditProffile = (req) => {
  const allowedFields = ["firstName", "lastName", "photoUrl", "about", "gender", "skills", "age"];
  const isEditAllowed = Object.keys(req.body).every((feild) => allowedFields.includes(feild));
  return isEditAllowed;
};

const validateCurrPassword = async (req) => {
  const password = req.user.password;
  const isPasswordMatch = await bcrypt.compare(req.body.currPassword, password);
  return isPasswordMatch;
};

const validNewPassword = async (req) => {
  const newPassword = req.body.newPassword;
  if (!validator.isStrongPassword(newPassword)) return false;
  req.user.password = await bcrypt.hash(newPassword, 10);
  return true;
};

module.exports = {
  validateSignUpData,
  validateEditProffile,
  validateCurrPassword,
  validNewPassword,
};
