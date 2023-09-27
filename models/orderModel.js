const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  orderId: {
    type: String
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  address: {
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    pinCode: {
      type: Number,
    },
    landMark: {
      type: String,
    },
    street: {
      type: String,
    },
  },
  unitPrice: {
    type: Number
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  size: {
    type: String
  },
  quantity: {
    type: Number
  },
  total: {
    type: Number
  },
  paymentGatewayOrderId: {
    type: String,
    select: false
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  orderStatus: {
    type: String,
    enum: ["unconfirmed", "confirmed", "Processing", "QualityCheck", "Dispatch", "Delivered"],
    default: "unconfirmed",
  },
  delivered: {
    type: Boolean,
    default: false
  },
  returnStatus: {
    type: String,
    enum: ["return", "cancel", ""],
    default: ""
  },
  returnPickStatus: {
    type: String,
    enum: ["Pending", "Accept", "Reject", "Pick", ""],
  },
  returnOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cancelReturnOrder",
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);
