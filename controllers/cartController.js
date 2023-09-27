const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const ErrorHander = require("../utils/errorhander");
const moment = require("moment");
exports.addToCart = async (req, res, next) => {
  try {
    const product = req.params.id;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await createCart(req.user._id);
    }
    const productIndex = cart.products.findIndex((cartProduct) => {
      if (req.body.sizeGiven == true) {
        return ((cartProduct.product.toString() == product) && (cartProduct.size.toString() == req.body.size));
      } else {
        return cartProduct.product.toString() == product;
      }
    });
    if (productIndex < 0) {
      let obj;
      if (req.body.sizeGiven == true) {
        obj = {
          product: product,
          size: req.body.size,
          quantity: req.body.quantity
        }
      } else {
        obj = {
          product: product,
          quantity: req.body.quantity
        }
      }
      cart.products.push(obj);
      await cart.save();
      return res.status(200).json({ msg: "product added to cart", data: cart });
    } else {
      return res.status(200).json({ msg: "product already in cart", data: cart });
    }


  } catch (error) {
    next(error);
  }
};
exports.updateQuantity = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id, });
    if (!cart) {
      cart = await createCart(req.user._id);
    }
    const productIndex = cart.products.findIndex((cartProduct) => {
      return cartProduct._id.toString() == id;
    });
    if (productIndex >= 0 && quantity > 0) {
      cart.products[productIndex].quantity = quantity;
    }
    await cart.save();
    return res.status(200).json({
      success: true,
      msg: "cart updated",
      cart: cart,
    });
  } catch (error) {
    next(error);
  }
};
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.params.id });
    if (!cart) {
      return res.status(201).json({ message: "No Data Found ", cart: [] })
    }
    console.log(cart);
    const cartResponse = await getCartResponse(cart);

    return res.status(200).json({
      success: true,
      msg: "cart",
      cart: cartResponse
    })
  } catch (error) {
    next(error);
  }
}
exports.applyCoupon = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.body.userId });

    const coupon = await Coupon.findOne({ couponCode: req.body.couponCode, expirationDate: { $gte: new Date(moment().format("YYYY-MM-DD")) }, activationDate: { $lte: new Date(moment().format("YYYY-MM-DD")) } })
    console.log("coupon", coupon)
    console.log("cartCoupon", cart)
    if (!coupon) {
      next(new ErrorHander("invalid coupon code", 400))
    }

    cart.coupon = coupon._id;

    await cart.save();

    return res.status(200).json({
      success: true,
      msg: "coupon applied successfully"
    })

  } catch (error) {
    console.log(error);
    next(error);

  }
}
const createCart = async (userId) => {
  try {
    const cart = await Cart.create({ user: userId });

    return cart;
  } catch (error) {
    throw error;
  }
};
const getCartResponse = async (cart, req, res) => {
  try {
    await cart.populate([
      { path: "products.product", select: { reviews: 0 } },
      { path: "coupon", select: "couponCode discount expirationDate" },
    ]);

    if (cart.coupon && moment().isAfter(cart.coupon.expirationDate, "day")) {
      cart.coupon = undefined;
      cart.save();
    }
    const cartResponse = cart.toObject();
    console.log(cartResponse);

    let discount = 0;
    let total = 0;
    cartResponse.products.forEach((cartProduct) => {
      console.log(cartProduct)
      if (cartProduct.product == null || cartProduct.product == 0) {
        //   cart.product= cart.product.filter(function(item) {
        //     return item !== 
        // })
        cart.products = [];
        cart.quantity = 0
        cart.subTotal = 0
        let data = cart.save();
        return res.status(500).json({
          message: "Product is not Avaible in cart "
        })
      } else {
        cartProduct.total = cartProduct.product.price * cartProduct.quantity;
        total += cartProduct.total;
      }
    });

    if (cartResponse.coupon) {
      discount = 0.01 * cart.coupon.discount * total;
    }

    cartResponse.subTotal = total;
    cartResponse.discount = discount;
    cartResponse.total = total - discount;
    cartResponse.shipping = 10;

    return cartResponse;
  } catch (error) {
    throw error;
  }
};
const orderByCOD = async (req, res) => {
  try {

  } catch (err) {
    console.log(err)
    throw err
  }
}
exports.deleteCart = async (req, res) => {
  try {
    let findCart = await Cart.findOne({ user: req.user._id });
    if (!findCart) {
      return res.status(200).send({ status: 200, message: "Cart detail not found.", data: {} });
    } else {
      let update = await Cart.findByIdAndDelete({ _id: findCart._id });
      if (update) {
        return res.status(200).send({ status: 200, message: "Cart delete successfully.", data: {} });
      }
    }
  } catch (error) {
    console.log("380====================>", error)
    return res.status(501).send({ status: 501, message: "server error.", data: {}, });
  }
};
exports.deletecartItem = async (req, res) => {
  try {
    let findCart = await Cart.findOne({ user: req.user._id });
    if (findCart) {
      console.log(findCart);
      for (let i = 0; i < findCart.products.length; i++) {
        if (findCart.products.length > 1) {
          if (((findCart.products[i].product).toString() == req.params.id) == true) {
            let updateCart = await Cart.findByIdAndUpdate({ _id: findCart._id, 'products.product': req.params.id }, { $pull: { 'products': { product: req.params.id, quantity: findCart.products[i].quantity, } } }, { new: true })
            if (updateCart) {
              return res.status(200).send({ message: "Product delete from cart.", data: updateCart, });
            }
          }
        } else {
          let updateProject = await Cart.findByIdAndDelete({ _id: findCart._id });
          if (updateProject) {
            let findCart1 = await Cart.findOne({ user: req.user._id });
            if (!findCart1) {
              return res.status(200).send({ status: 200, "message": "No Data Found ", cart: [] });
            }
          }
        }
      }
    } else {
      return res.status(200).send({ status: 200, "message": "No Data Found ", cart: [] });
    }

  } catch (error) {
    console.log("353====================>", error)
    return res.status(501).send({ status: 501, message: "server error.", data: {}, });
  }
};