const driver = require('../models/driverRegtration');
const order = require('../models/orderModel');
const User = require('../models/userModel')
const DriverOrder = require('../models/driver_order')
const rejectOrder = require('../models/rejectreasons')
const address = require('../models/AddressModel')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const otpHelper = require("../utils/otp");
const { error } = require('console');
const product = require('../models/productModel')
const JWTkey = process.env.JWT_SECRET
const notify = require('../models/notification');
const driverCommission = require('../models/driverCommission');

exports.sendOtp = async (req, res) => {
    try {
        const Data = await driver.findOne({ phone: req.body.phone })
        if (!Data) {
            const otp = await otpHelper.generateOTP(4);
            const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
            const verified = false;
            const data = await driver.create({
                phone: req.body.phone,
                otp: otp,
                otpExpiration,
                verified
            });
            return res.status(200).json({ data: data, })
        } else {
            const otp = await otpHelper.generateOTP(4);
            const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
            const verified = false;
            const data = await driver.findByIdAndUpdate({ _id: Data._id }, { $set: { otp: otp, otpExpiration: otpExpiration, verified: verified } }, { new: true });
            return res.status(200).json({ data: data })
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}
exports.accountVerificationOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await driver.findById({ _id: req.params.id });
        if (!user) {
            return res.status(404).send({ message: "user not found" });
        }
        if (user.otp !== otp || user.otpExpiration < Date.now()) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        const updated = await driver.findByIdAndUpdate({ _id: user._id }, { $set: { verified: true } }, { new: true });
        const token = jwt.sign({ user_id: updated._id }, JWTkey,);
        let obj = { id: updated._id, accessToken: token }
        return res.status(200).send({ status: 200, message: "logged in successfully", data: obj });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ error: "internal server error" + err.message });
    }
};
exports.AddDeriverDetails = async (req, res) => {
    try {
        const findUser = await driver.findById({ _id: req.user._id });
        if (findUser) {
            const Data = await driver.findOne({ _id: { $ne: findUser._id }, email: req.body.email })
            if (Data) {
                return res.status(201).json({ message: "Email is Already regtration" })
            } else {
                if (req.file) {
                    req.body.image = req.file.path
                }
                const obj = {
                    Name: req.body.Name || findUser.Name,
                    email: req.body.email || findUser.email,
                    image: req.body.image || findUser.image,
                }
                const data = await driver.findOneAndUpdate({ _id: req.user._id }, { $set: obj }, { new: true });
                return res.status(200).json({ success: true, details: data })
            }
        } else {
            return res.status(201).json({ status: 404, message: "User not found" })
        }
    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}

// exports.AddDeriverDetails = async(req,res) => {
//     try{
// const data = {
//     Name: req.body.Name, 
//     password: bcrypt.hashSync(req.body.password, 8),
//     email: req.body.email, 
//     image: req.body.image, 
// } 
//  const Data = await driver.findOne({email: req.body.email})
//  if(Data){
//     return res.status(201).json({
//         message: "Email is Already regtration"
//     })
//  }else{
//     const data = await driver.create(data);
//  return   res.status(200).json({
//         success: true, 
//         details : data
//     })
//  }
// }catch(err){
//      return   res.status(400).json({
//             message: err.message
//         })
//     }
// }

exports.AssignOrdertoDriver = async (req, res) => {
    try {
        const orderData = await order.findById({ _id: req.body.orderId });
        console.log(orderData);
        const productId = orderData.product;
        console.log(productId)
        const productData = await product.findOne({ _id: productId });
        console.log(productData)
        const UserData = await address.find({ user: orderData.user })
        const userData = await User.findById({ _id: orderData.user })
        console.log(productData.images)
        if (!orderData) {
            return res.status(500).json({
                message: "Order not found "
            })
        } else {
            const data = {
                orderId: req.body.orderId,
                driverId: req.body.driverId,
                image: productData.images[0],
                order: orderData,
                price: req.body.price,
                returnitem: req.body.returnitem,
                pickuporder: req.body.dilverdAddress,
                payment: req.body.payment,
                useraddress: UserData,
                username: userData.name,
                userMobile: userData.phone
            }
            const DOrder = await DriverOrder.create(data);
            return res.status(200).json({
                sucess: true,
                message: DOrder
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(400).json({
            message: err.message
        })
    }
}
exports.getUserDetails = async (req, res) => {
    const user = await driver.findById(req.params.id);
    return res.status(200).json({ success: true, user, });
};
exports.DriverAccept = async (req, res) => {
    try {
        const data = await DriverOrder.findOneAndUpdate({ _id: req.params.id }, {
            status: "Accept"
        }, { new: true },)
        return res.status(200).json({
            message: "Accepted"
        })
    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}
exports.DriverReject = async (req, res) => {
    try {
        const Data = await DriverOrder.findById({ _id: req.params.id })
        if (!Data) {
            return res.status(500).json({ message: "Driver_Order ID is not found " })
        }
        const data = await DriverOrder.findOneAndUpdate({ _id: req.params.id }, {
            status: "Reject"
        }, { new: true },)

        const RData = await rejectOrder.create({
            driverId: Data.driverId,
            reasons: req.body.reason

        })
        return res.status(200).json({
            message: "Reject"
        })
    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}
exports.DriverAllOrder = async (req, res) => {
    try {
        const Data = await DriverOrder.find({ driverId: req.user._id });
        if (Data.length == 0) {
            return res.status(201).json({
                message: "No Data Found "
            })
        }
        return res.status(200).json({
            sucess: true,
            message: Data
        })
    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}
exports.DeleteAssignOrder = async (req, res) => {
    try {
        await DriverOrder.findByIdAndDelete({ _id: req.params.id });
        return res.status(200).json({
            message: "Assign Order Deleted "
        })
    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}
exports.GetPriceByDriverId = async (req, res) => {
    try {
        const data = await DriverOrder.find({ driverId: req.user._id });
        console.log(data)
        const Data = data.map(d => {
            return result = {
                price: d.price,
                orderId: d._id,
                products: d.order.products
            }
        })
        let total = 0;
        for (let i = 0; i < Data.length; i++) {
            (total) += parseInt(Data[i].price)

        }
        console.log(total)
        return res.status(200).json({
            message: Data,
            total: total
        })
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: err.message
        })
    }
}
exports.DeliveredOrder = async (req, res) => {
    try {
        let a = await DriverOrder.findByIdAndUpdate({ _id: req.params.id }, { delivered: true, orderStatus: "Deliverd" }, { new: true });
        let finddriverCommission = await driverCommission.findOne({ driverId: a.driverId });
        if (finddriverCommission) {
            let obj = {
                orderId: a._id,
                commission: a.commission,
            }
            await driverCommission.findByIdAndUpdate({ _id: finddriverCommission._id }, { $set: { commission: finddriverCommission.commission + a.commission }, $push: { orders: obj } }, { new: true });
        } else {
            let obj = {
                orders: [{
                    orderId: a._id,
                    commission: a.commission,
                }],
                driverId: a.driverId,
                commission: a.commission
            }
            await driverCommission.create(obj)
        }
        const data = {
            message: "order has been Delivered",
            driverId: a.driverId
        }
        const Data = await notify.create(data)
        const orderData = await order.findById({ _id: a.orderId });
        const data1 = {
            message: "Your order has been Delivered",
            userId: orderData.user
        }
        await notify.create(data1)
        return res.status(200).json({ message: "Delivered " })
    } catch (err) {
        console.log(err)
        return res.status(400).json({
            message: err.message
        })
    }
}
exports.DeliveredEarning = async (req, res) => {
    try {
        const findUser = await driver.findById({ _id: req.user._id });
        if (findUser) {
            let finddriverCommission = await driverCommission.findOne({ driverId: findUser._id });
            if (finddriverCommission) {
                return res.status(200).json({ status: 200, message: "Commission found", data: finddriverCommission })
            } else {
                return res.status(200).json({ status: 200, message: "Commission not found", data: {} })
            }
        } else {
            return res.status(404).json({ status: 404, message: "User not found", data: {} })
        }
    } catch (err) {
        console.log(err)
        return res.status(400).json({
            message: err.message
        })
    }
}
exports.logout = async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    return res.status(200).json({
        success: true,
        message: "Logged Out",
    });
};
exports.AllDrivers = async (req, res) => {
    try {
        const Data = await driver.find()
        if (Data.length == 0) {
            return res.status(201).json({
                message: "No Data Found "
            })
        } else {
            return res.status(200).json({
                message: Data
            })
        }
    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}
exports.driverCompleted = async (req, res) => {
    try {
        const data = await DriverOrder.find({ driverId: req.params.driverId, orderStatus: "Deliverd" });

        if (data.length == 0) {
            return res.status(201).json({
                message: "No Delivered Order "
            })
        } else {
            return res.status(200).json({
                message: data
            })
        }
    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}
exports.PendingOrder = async (req, res) => {
    try {
        const data = await DriverOrder.find({
            $and: [
                { driverId: req.params.id },
                { status: "pending" }
            ]
        });
        console.log(data)
        return res.status(200).json({
            message: data
        })
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: err.message
        })
    }
}
exports.AcceptOrder = async (req, res) => {
    try {
        const data = await DriverOrder.find({
            $and: [
                { driverId: req.params.id },
                { status: "Accept" }
            ]
        });
        console.log(data)
        return res.status(200).json({
            message: data
        })
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: err.message
        })
    }
}
exports.ChangeStatus = async (req, res) => {
    try {
        const driverData = await driver.findById({ _id: req.params.id })
        driverData.status = req.body.status
        driverData.save();
        return res.status(200).json({
            message: "ok",
            result: driverData
        })
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: "ok",
            error: err.message
        })
    }
}
exports.DeleteDriver = async (req, res) => {
    try {
        await driver.findByIdAndDelete({ _id: req.params.id });
        return res.status(200).json({
            message: "Driver Deleted ",
        })
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: "ok",
            error: err.message
        })
    }
}
exports.updateCommission = async (req, res) => {
    try {
        const Data = await DriverOrder.findById({ _id: req.params.id })
        if (!Data) {
            return res.status(500).json({ message: "Driver_Order ID is not found " })
        }
        const data = await DriverOrder.findByIdAndUpdate({ _id: req.params.id }, { commission: req.body.commission }, { new: true },)
        return res.status(200).json({ message: "Reject", data: data })
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}
exports.updateDutyStatus = async (req, res) => {
    try {
        const findUser = await driver.findById({ _id: req.user._id });
        if (findUser) {
            if (findUser.duty == true) {
                const data = await driver.findOneAndUpdate({ _id: req.user._id }, { $set: { duty: false } }, { new: true });
                return res.status(200).json({ success: true, details: data })
            } else {
                const data = await driver.findOneAndUpdate({ _id: req.user._id }, { $set: { duty: true } }, { new: true });
                return res.status(200).json({ success: true, details: data })
            }
        } else {
            return res.status(201).json({ status: 404, message: "User not found" })
        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}
exports.updateNotifactionStatus = async (req, res) => {
    try {
        const findUser = await driver.findById({ _id: req.user._id });
        if (findUser) {
            if (findUser.notification == true) {
                const data = await driver.findOneAndUpdate({ _id: req.user._id }, { $set: { notification: false } }, { new: true });
                return res.status(200).json({ success: true, details: data })
            } else {
                const data = await driver.findOneAndUpdate({ _id: req.user._id }, { $set: { notification: true } }, { new: true });
                return res.status(200).json({ success: true, details: data })
            }
        } else {
            return res.status(201).json({ status: 404, message: "User not found" })
        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}
