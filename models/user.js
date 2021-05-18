const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    Email: String,
    password : String,
    name: String,
    role: String,
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
