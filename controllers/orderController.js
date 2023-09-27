const Order = require("../models/orderModel");
const userOrders = require('../models/userOrders')
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Vender = require("../models/vendorModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cancelReturnOrder = require('../models/cancelReturnOrder')
const Address = require("../models/AddressModel");

exports.getAllOrdersVender = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.aggregate([
    {
      $project: {
        orderItems: {
          $filter: {
            input: "$orderItems",
            as: "newOrderItems",
            cond: { "$$newOrderItems.venderId": req.user._id },
          },
        },
      },
    },
  ]);

  return res.status(200).json({
    success: true,
    orders,
  });
});
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHander("You have already delivered this order", 400));
  }

  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (o) => {
      await updateStock(o.product, o.quantity);
    });
  }
  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  return res.status(200).json({
    success: true,
  });
});
async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.Stock -= quantity;

  await product.save({ validateBeforeSave: false });
}
exports.placeOrder = async (req, res) => {
  try {
    let findUserOrder = await userOrders.findOne({ orderId: req.params.orderId });
    if (findUserOrder) {
      if (req.body.paymentStatus == "paid") {
        let update = await userOrders.findByIdAndUpdate({ _id: findUserOrder._id }, { $set: { orderStatus: "confirmed", paymentStatus: "paid", paymentGatewayOrderId: "Online" } }, { new: true });
        for (let i = 0; i < findUserOrder.Orders.length; i++) {
          let findu = await Order.findOne({ _id: findUserOrder.Orders[i] });
          if (findu) {
            await Order.findByIdAndUpdate({ _id: findu._id }, { $set: { orderStatus: "confirmed", paymentStatus: "paid", paymentGatewayOrderId: "Online" } }, { new: true });
          }
        }
        return res.status(200).json({ message: "Payment success.", status: 200, data: {} });
      }
      if (req.body.paymentStatus == "failed") {
        return res.status(201).json({ message: "Payment failed.", status: 201, orderId: findUserOrder });
      }
    } else {
      return res.status(404).json({ message: "No data found", data: {} });
    }
  } catch (error) {
    console.log(error);
    return res.status(501).send({ status: 501, message: "server error.", data: {}, });
  }
};
exports.placeOrderCOD = async (req, res) => {
  try {
    let findUserOrder = await userOrders.findOne({ orderId: req.params.orderId });
    if (findUserOrder) {
      let update = await userOrders.findByIdAndUpdate({ _id: findUserOrder._id }, { $set: { orderStatus: "confirmed", paymentStatus: "pending", paymentGatewayOrderId: "Cash" } }, { new: true });
      for (let i = 0; i < findUserOrder.Orders.length; i++) {
        let findu = await Order.findOne({ _id: findUserOrder.Orders[i] });
        if (findu) {
          await Order.findByIdAndUpdate({ _id: findu._id }, { $set: { orderStatus: "confirmed", paymentStatus: "pending", paymentGatewayOrderId: "Cash" } }, { new: true });
        }
      }
      return res.status(200).json({ message: "Payment success.", status: 200, data: {} });
    } else {
      return res.status(404).json({ message: "No data found", data: {} });
    }
  } catch (error) {
    console.log(error);
    return res.status(501).send({ status: 501, message: "server error.", data: {}, });
  }
};
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await userOrders.find({ user: req.user._id, orderStatus: "confirmed" }).populate({ path: 'Orders', populate: [{ path: 'product', model: 'Product' },] })
    if (orders.length == 0) {
      return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
    }
    return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
  } catch (error) {
    console.log(error);
    return res.status(501).send({ status: 501, message: "server error.", data: {}, });
  }
};
exports.getOrders = async (req, res, next) => {
  try {
    console.log("124==============", req.user);
    const orders = await Order.find({ user: req.user._id, orderStatus: "confirmed" }).populate("product")
    if (orders.length == 0) {
      return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
    }
    return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
  } catch (error) {
    console.log(error);
    return res.status(501).send({ status: 501, message: "server error.", data: {}, });
  }
};
exports.getSingleOrder = async (req, res, next) => {
  try {
    const orders = await Order.findById({ _id: req.params.id }).populate("product")
    if (!orders) {
      return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
    }
    return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
  } catch (error) {
    console.log(error);
    return res.status(501).send({ status: 501, message: "server error.", data: {}, });
  }
};
exports.checkout = async (req, res) => {
  try {
    let findOrder = await userOrders.find({ user: req.user._id, orderStatus: "unconfirmed" });
    if (findOrder.length == 0) {
      let orderId;
      let cart = await Cart.findOne({ user: req.user._id }).populate({ path: "products.product", select: { review: 0 }, }).populate({ path: "coupon", select: "couponCode discount expirationDate", });
      if (cart) {
        const findAddress = await Address.findOne({ _id: req.body.addressId, user: req.user._id });
        if (findAddress) {
          orderId = await reffralCode();
          let address = { address: findAddress.address, city: findAddress.city, state: findAddress.state, pinCode: findAddress.pinCode, landMark: findAddress.landMark, street: findAddress.street };
          let grandTotal = 0, Orders = [];
          for (let i = 0; i < cart.products.length; i++) {
            const total = cart.products[i].quantity * cart.products[i].product.price;
            grandTotal += total;
            let obj = {
              orderId: orderId,
              user: req.user._id,
              address: address,
              product: cart.products[i].product._id,
              unitPrice: cart.products[i].product.price,
              size: cart.products[i].size,
              quantity: cart.products[i].quantity,
              total: total,
            }
            const user = await Order.create(obj);
            Orders.push(user._id)
          }
          let discount = 0, coupon, shippingPrice;
          if (cart.coupon) {
            coupon = cart.coupon._id;
            discount = 0.01 * cart.coupon.discount * grandTotal;
          }
          shippingPrice = 10;
          amountToBePaid = grandTotal + shippingPrice - discount;
          let obj = {
            user: req.user._id,
            orderId: orderId,
            Orders: Orders,
            grandTotal: grandTotal,
            discount: discount,
            shippingPrice: shippingPrice,
            amountToBePaid: amountToBePaid,
            address: address,
            coupon: coupon,
          }
          const user = await userOrders.create(obj);
          let findUserOrder = await userOrders.findOne({ orderId: orderId }).populate('Orders');
          return res.status(200).json({ status: 200, message: "Order create successfully. ", data: findUserOrder })
        } else {
          return res.status(404).json({ success: true, msg: "Address not found", });
        }
      }
    } else {
      for (let i = 0; i < findOrder.length; i++) {
        await userOrders.findOneAndDelete({ orderId: findOrder[i].orderId });
        let findOrders = await Order.find({ orderId: findOrder[i].orderId });
        if (findOrders.length > 0) {
          for (let j = 0; j < findOrders.length; j++) {
            await Order.findByIdAndDelete({ _id: findOrders[j]._id });
          }
        }
      }
      let orderId;
      let cart = await Cart.findOne({ user: req.user._id }).populate({ path: "products.product", select: { review: 0 }, }).populate({ path: "coupon", select: "couponCode discount expirationDate", });
      if (cart) {
        const findAddress = await Address.findOne({ _id: req.body.addressId, user: req.user._id });
        if (findAddress) {
          orderId = await reffralCode();
          let address = { address: findAddress.address, city: findAddress.city, state: findAddress.state, pinCode: findAddress.pinCode, landMark: findAddress.landMark, street: findAddress.street };
          let grandTotal = 0, Orders = [];
          for (let i = 0; i < cart.products.length; i++) {
            const total = cart.products[i].quantity * cart.products[i].product.price;
            grandTotal += total;
            let obj = {
              orderId: orderId,
              user: req.user._id,
              address: address,
              product: cart.products[i].product._id,
              unitPrice: cart.products[i].product.price,
              size: cart.products[i].size,
              quantity: cart.products[i].quantity,
              total: total,
            }
            const user = await Order.create(obj);
            Orders.push(user._id)
          }
          let discount = 0, coupon, shippingPrice;
          if (cart.coupon) {
            coupon = cart.coupon._id;
            discount = 0.01 * cart.coupon.discount * grandTotal;
          }
          shippingPrice = 10;
          amountToBePaid = grandTotal + shippingPrice - discount;
          let obj = {
            user: req.user._id,
            orderId: orderId,
            Orders: Orders,
            grandTotal: grandTotal,
            discount: discount,
            shippingPrice: shippingPrice,
            amountToBePaid: amountToBePaid,
            address: address,
            coupon: coupon,
          }
          const user = await userOrders.create(obj);
          let findUserOrder = await userOrders.findOne({ orderId: orderId }).populate('Orders');
          return res.status(200).json({ status: 200, message: "Order create successfully. ", data: findUserOrder })
        } else {
          return res.status(404).json({ success: true, msg: "Address not found", });
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(501).send({ status: 501, message: "server error.", data: {}, });
  }
};
exports.returnOrder = async (req, res, next) => {
  try {
    const orders = await Order.findById({ _id: req.params.id });
    if (!orders) {
      return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
    } else {
      if (orders.orderStatus == "Delivered") {
        let obj = {
          userId: orders.user,
          Orders: orders._id,
          reason: req.body.reason,
          orderStatus: "return",
          pickStatus: "Pending"
        }
        const data = await cancelReturnOrder.create(obj);
        let update = await Order.findByIdAndUpdate({ _id: orders._id }, { $set: { returnOrder: data._id, returnStatus: "return", returnPickStatus: "Pending" } }, { new: true }).populate('returnOrder');
        if (update) {
          return res.status(200).json({ message: `Order return Successfully.`, status: 200, data: update });
        }
      } else if ((orders.orderStatus == "confirmed") || (orders.orderStatus == "Processing") || (orders.orderStatus == "QualityCheck")) {
        let obj = {
          userId: orders.user,
          Orders: orders._id,
          reason: req.body.reason,
          orderStatus: "cancel",
          pickStatus: ""
        }
        const data = await cancelReturnOrder.create(obj);
        let update = await Order.findByIdAndUpdate({ _id: orders._id }, { $set: { returnOrder: data._id, returnStatus: "cancel", returnPickStatus: "" } }, { new: true }).populate('returnOrder');
        if (update) {
          return res.status(200).json({ message: `Order cancel Successfully.`, status: 200, data: update });
        }
      } else {
        return res.status(200).json({ message: `Order can not cancel because order is dispatched.`, status: 200, data: orders });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(501).send({ status: 501, message: "server error.", data: {}, });
  }
};
exports.getcancelReturnOrder = async (req, res, next) => {
  try {
    console.log(req.user);
    const orders = await cancelReturnOrder.find({ userId: req.user._id })
      .populate({ path: 'Orders', populate: [{ path: 'product', model: 'Product' },] })
    if (orders.length == 0) {
      return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
    }
    return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
  } catch (error) {
    console.log(error);
    return res.status(501).send({ status: 501, message: "server error.", data: {}, });
  }
};
const reffralCode = async () => {
  var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let OTP = '';
  for (let i = 0; i < 9; i++) {
    OTP += digits[Math.floor(Math.random() * 36)];
  }
  return OTP;
}
// exports.checkout = async (req, res, next) => {
//   try {
//     await Order.findOneAndDelete({ user: req.body.userId, orderStatus: "unconfirmed", });
//     const cart = await Cart.findOne({ user: req.body.userId }).populate({ path: "products.product", select: { review: 0 }, }).populate({ path: "coupon", select: "couponCode discount expirationDate", });
//     const findAddress = await Address.findOne({ _id: req.body.addressId, user: req.body.userId });
//     if (findAddress) {
//       let address = {
//         address: findAddress.address,
//         city: findAddress.city,
//         state: findAddress.state,
//         pinCode: findAddress.pinCode,
//         landMark: findAddress.landMark,
//         street: findAddress.street
//       };
//       const order = new Order({ user: req.body.userId, address });
//       let grandTotal = 0;
//       const orderProducts = cart.products.map((cartProduct) => {
//         const total = cartProduct.quantity * cartProduct.product.price;
//         grandTotal += total;
//         return {
//           product: cartProduct.product._id,
//           unitPrice: cartProduct.product.price,
//           quantity: cartProduct.quantity,
//           total,
//         };
//       });
//       order.products = orderProducts;
//       if (cart.coupon) {
//         order.coupon = cart.coupon._id;
//         order.discount = 0.01 * cart.coupon.discount * grandTotal;
//       }
//       order.grandTotal = grandTotal;
//       order.shippingPrice = 10;
//       order.amountToBePaid = grandTotal + order.shippingPrice - order.discount;
//       await order.save();
//       await order.populate([{ path: "products.product", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate", },]);
//       return res.status(200).json({ success: true, msg: "order created", order, });
//     } else {
//       return res.status(404).json({ success: true, msg: "Address not found", });
//     }
//   } catch (error) {
//     next(error);
//   }
// };