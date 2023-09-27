const mongoose = require('mongoose');
const staticContent = mongoose.Schema({
    title: {
        type: String
    },
    desc: {
        type: String
    },
}, { timestamps: true })
module.exports = mongoose.model('aboutus', staticContent);