const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    timeStamp: Date.now(),
    status: String,
    
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    orderValue: Number 

})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order
