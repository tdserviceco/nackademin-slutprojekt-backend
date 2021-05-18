const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    title: String,
    price : String,
    shortDesc: String,
    longDesc: String,
    imgFile: String,
    
    
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product
