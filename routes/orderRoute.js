const express = require("express");
const orderController = require("../controllers/orderController");
const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post("/checkout", isAuthenticatedUser, orderController.checkout);
router.post("/placeOrder/:orderId", isAuthenticatedUser, orderController.placeOrder);
router.post("/placeorderCod/:orderId", isAuthenticatedUser, orderController.placeOrderCOD);
router.get("/orders/me", isAuthenticatedUser, orderController.getOrders)
router.get("/allorders/me", isAuthenticatedUser, orderController.getAllOrders)
router.route("/order/:id").get(orderController.getSingleOrder);
router.route("/admin/order/:id").put(orderController.updateOrder)
router.get("/admin/orders", orderController.getAllOrdersAdmin);
router.put("/order/returnOrder/:id", isAuthenticatedUser, orderController.returnOrder);
router.get("/order/get/ReturnOrder", isAuthenticatedUser, orderController.getcancelReturnOrder);
module.exports = router;
