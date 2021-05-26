const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    role: {
        type: String,
        default: 'Customer',
        lowercase: true
    },
    adress: {
        street: String,
        zip: Number,
        city: String
    },

    orderhistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
})

const User = mongoose.model('User', userSchema)
module.exports = User