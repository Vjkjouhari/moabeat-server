const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email Must not be Empty"],
  },
  password: {
    type: String,
    required: [true, "Password should not be empty"],
  },
  mobile_no: {
    type: String,
    required: [true, "Mobile Number must empty"],
  },
  date_added: {
    type: String,
    default: Date.now(),
  },
  is_verified: {
    type: Number,
    default: 1, // approved
  },
  profile_image: {
    type: String,
    default: null,
  },
  token: {
    type: String,
    default: null,
  },
});
module.exports = mongoose.model("User", userSchema);
