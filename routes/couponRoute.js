const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = require("express").Router();
const couponController = require("../controllers/couponController");

router.post(
  "/",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  couponController.createCoupon
);

router.get(
  "/all",
  couponController.getAllCoupons
);

router.get("/", isAuthenticatedUser, couponController.getActiveCoupons);

router.delete(
  "/:couponId",
  couponController.deleteCoupon
);

module.exports = router;
