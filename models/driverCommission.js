const mongoose = require('mongoose');



const DriverOrders = mongoose.Schema({
    orders: [{
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
        commission: {
            type: Number,
            default: 0
        },
    }],
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "driver",
        require: [true, "DriverID is required "]
    },
    commission: {
        type: Number,
        default: 0
    },
})


const deiverOrder = mongoose.model('driverCommission', DriverOrders);

module.exports = deiverOrder