const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const schema = mongoose.Schema;
const DocumentSchema = schema({
  user: {
    type: schema.Types.ObjectId,
    ref: "user"
  },
  orderId: {
    type: String
  },
  Orders: [{
    type: schema.Types.ObjectId,
    ref: "Order",
  }],
  grandTotal: {
    type: Number,
    required: true,
    default: 0,
  },
  discount: {
    type: Number,
    required: true,
    default: 0,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  amountToBePaid: {
    type: Number,
    required: true,
    default: 0,
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
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon"
  },
  paymentOption: {
    type: String,
    enum: ["PrePaid", "PostPaid"],
    default: "PrePaid"
  },
  orderStatus: {
    type: String,
    enum: ["unconfirmed", "confirmed", "Processing", "QualityCheck", "Dispatch", "Delivered"],
    default: "unconfirmed",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
}, { timestamps: true })
DocumentSchema.plugin(mongoosePaginate);
DocumentSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("userOrder", DocumentSchema);