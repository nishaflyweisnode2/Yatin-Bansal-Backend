const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = require("express").Router();
const cartController = require("../controllers/cartController");

router.post("/:id", isAuthenticatedUser, cartController.addToCart);

router.put("/:id", isAuthenticatedUser, cartController.updateQuantity);

router.get("/:id", isAuthenticatedUser, cartController.getCart);

router.put("/", isAuthenticatedUser, cartController.applyCoupon)
router.delete("/", isAuthenticatedUser, cartController.deleteCart);
router.delete("/Item/:id", isAuthenticatedUser, cartController.deletecartItem);


module.exports = router;