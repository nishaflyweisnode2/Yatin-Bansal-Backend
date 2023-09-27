const express = require("express");
const auth = require("../controllers/subscription");
const router = express.Router();


router.route("/Subscription/new").post(auth.createSubscription);
router.route("/Subscription").get(auth.getAllSubscription);
router.route("/Subscription/:id").put(auth.updateSubscription);
router.route("/Subscription/byId/:id").get(auth.getSubscriptionById);
router.route("/Subscription/:id").delete(auth.deleteSubscription);
module.exports = router;
