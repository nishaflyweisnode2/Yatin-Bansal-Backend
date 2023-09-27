const express = require("express");
const {
  processPayment,
  sendRazorpayApiKey,
} = require("../controllers/paymentController");
const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/auth");

router.route("/payment/process").post(isAuthenticatedUser, processPayment);

router.route("/razorpayapikey").get(isAuthenticatedUser, sendRazorpayApiKey);

module.exports = router;
