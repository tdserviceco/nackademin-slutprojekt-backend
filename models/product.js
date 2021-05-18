const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  
    title: String,
    price : String,
    shortDesc: String,
    longDesc: String,
    imgFile: String,
    
    
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product
