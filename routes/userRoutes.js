const express = require("express");
const { registerUser, verifyEmail } = require("../controller/auth/auth");
const router = express.Router();

router.route("/acd").get((req, res) => {
  console.log("sdfsdfsdf");
  res.status(200).json({
    message: "Welcome to the API",
  });
});

router.route("/sign-up").post(registerUser);
router.route("verify-token/:token").get(verifyEmail);

module.exports = router;
