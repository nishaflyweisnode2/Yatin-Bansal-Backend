const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const Driver = mongoose.Schema({
    Name: {
        type: String,
        require: false
    },
    password: {
        type: String,
        require: false
    },
    phone: {
        type: String,
        require: false
    },
    email: {
        type: String,
        require: false
    },
    image: {
        type: String,
        require: false
    },
    otp: {
        type: String,
        require: true
    },
    otpExpiration: {
        type: Date,
    },
    verified: {
        type: Boolean,
        default: false
    },
    duty: {
        type: Boolean,
        default: false
    },
    notification: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default: "disapprove"
    }
})

const driver = mongoose.model('driver', Driver);

module.exports = driver