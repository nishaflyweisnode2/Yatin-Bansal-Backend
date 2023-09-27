const mongoose = require('mongoose');


const AdminSchema = mongoose.Schema({
    name: {
        type: String, 

    }, 
    email: {
        type: String,
        unique: true
    }, 
    password: {
        type: String
    }, 
    role: {
        type: String,
        role: "admin"
    }
})

module.exports = mongoose.model('admin', AdminSchema)