const {randomInt} = require("crypto");

exports.generateOTP = async function (length) {
    let otp = "";
    for (let i = 0; i < length; ++i) {
      otp += randomInt(0, 10);
    }
    return otp;
}