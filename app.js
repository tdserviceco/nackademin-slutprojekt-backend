const express = require('express')
const app = express()
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const db = mongoose.connection;
const User = require('./models/user')
const Product = require('./models/product')
const Order = require('./models/order')


//Middleware
app.use(express.static('public'))
require('dotenv').config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const connection = () => {
  mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function () {
 

  //Routes 

  // for register user 
  app.post('/api/register', (req,res) => {
    console.log(req.body)
    const newUser = new User({
      
      email:req.body.email,
      name: req.body.name,
      password: req.body.password,
      adress:{
        street:req.body.street,
        zip:req.body.zip,
        city:req.body.city        
      }
    })

    newUser.save((err) =>{
      if (err)  res.send(err)
      else res.json(newUser)
    })

  })


  //for sign in
  app.post('/api/auth', async (req,res) =>{
    const user = await User.findOne({user: req.body.user, password: req.body.password})
    res.json(user)
  })
  

  // add product 
  //only accsess for admins
  app.post('/api/products',(req,res) =>{
    const newProduct= new Product ({
      title: req.body.title,
      price: req.body.price,
      shortDesc: req.body.shortDesc,
      longDesc: req.body.longDesc,
      imgFile: req.body.imgFile,
    })

    newProduct.save((err) =>{
      if (err)  res.send(err)
      else res.json(newProduct)
    })
  })

  //get all products
  app.get ('/api/products',async(req,res)=>{
    const allProducts = await Product.find({})
    res.json(allProducts)
  })


  //get product byId
  app.get ('/api/products/:id', async(req,res)=>{
    const getProduct = await Product.findById(req.params.id)
    res.json(getProduct)
  })

  //delete product byId
  app.delete ('/api/products/:id', async(req,res) =>{
    const removeProduct = await Product.deleteOne({_id:req.params.id})
    res.json(removeProduct)
  })

  //Update Product
  //insert function for valdition 
  app.patch ('/api/products/:id', async(req,res) =>{
    const updateProduct = await Product.updateOne({_id:req.params.id}, {$set:{price:req.body.price}})
    res.json(updateProduct)
  })

  //post orders
  app.post ('/api/orders', async (req,res) =>{
    const postOrder = new Order({
      status:req.body.status
    })

     postOrder.save ((err)=>{
      if (err) console.log(err)
     })  
    
     
    const product = await Product.findOne({_id:'60a3c4d08110053cdc4551b1'})
    product.save()
    postOrder.items.push(product)
    postOrder.save()

   res.json( postOrder)
  })

  //get all Orders
  app.get('/api/orders',async (req,res) =>{
    const allOrders = await Order.find({})
    res.json(allOrders)
  })
})
}




module.exports = {app, connection}