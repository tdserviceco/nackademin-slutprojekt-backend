const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({

    timeStamp: {
        type: Date,
        default: Date.now(),
    },
    status: String,
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    orderValue: Number

})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order