const mongoose = require("mongoose");

const cartProductsSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    size: {
        type: String
    },
    quantity: {
        type: Number,
        default: 1
    }
}, { _id: true })

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    products: {
        type: [cartProductsSchema]
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
        default: null,
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Cart", CartSchema)