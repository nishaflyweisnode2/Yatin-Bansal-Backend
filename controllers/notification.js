const notify = require('../models/notification');

exports.AddNotification = async (req, res) => {
    try {
        const data = {
            message: req.body.message,
        }
        const Data = await notify.create(data)
        return res.status(200).json({
            message: Data
        })
    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}

// exports.AddNotification = async (req, res) => {
//     try {
//         const { driverId, userId, message } = req.body;

//         const newNotification = new notify({
//             driverId,
//             userId,
//             message,
//         });

//         const savedNotification = await newNotification.save();

//         return res.status(201).json(savedNotification);
//     } catch (err) {
//         return res.status(400).json({ message: err.message });
//     }
// };


exports.GetAllNotification = async (req, res) => {
    try {
        const data = await notify.find({ driverId: req.params.driverId });
        return res.status(200).json({
            message: data,
            total: data.length
        })
    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}

exports.GetAllNotificationForUser = async (req, res) => {
    try {
        const data = await notify.find({ userId: req.params.userId });
        return res.status(200).json({
            message: data,
            total: data.length
        })
    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}

exports.GetAllNotificationForAdmin = async (req, res) => {
    try {
        const data = await notify.find();
        console.log("dta", data);
        return res.status(200).json({
            message: data,
            total: data.length
        });
    } catch (err) {
        return res.status(400).json({
            message: err.message
        });
    }
}


exports.GetBYNotifyID = async (req, res) => {
    try {
        const data = await notify.findById({ _id: req.params.id })
        return res.status(200).json({
            message: data
        })
    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}


exports.deleteNotification = async (req, res) => {
    try {
        await notify.findByIdAndDelete({ _id: req.params.id });
        return res.status(200).json({
            message: "Notification Deleted "
        })
    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}

