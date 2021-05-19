const express = require('express')
const app = express()
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { createToken, deCryptHash, hashGenerator, verifyToken } = require('./functions/methods');
const db = mongoose.connection;
const User = require('./models/user')
const Product = require('./models/product')
const Order = require('./models/order')

//Middleware
app.use(express.static('public'))
require('dotenv').config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

let tokenInCookies = '';

const connection = () => {
  mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true});
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function () {


    //Routes 

    // for register user 
    app.post('/api/register', async (req, res) => {
      const user = await User.findOne({email: req.body.email});

      if(!user){
        const newUser = new User({
            email: req.body.email,
            name: req.body.name,
            password: hashGenerator(req.body.password),
            adress: {
              street: req.body.street,
              zip: req.body.zip,
              city: req.body.city
            }
        })

        newUser.save((err) => {
        err ? res.send(err) : res.json(newUser)
        })
      }
      else {
        res.json({msg: "Email already taken"});
      }

    })

    //for sign in
    app.post('/api/auth', async (req, res) => {
        const user = await User.findOne({ 
          email: req.body.email
        });
        if(user && deCryptHash(req.body.password, user.password)) {
            const token = createToken(user);
            res.cookie('auth-token', token);
            tokenInCookies = token;
            res.json({msg: "You're logged in!"});
        } else {
            res.json({msg: "Login failed. Invalid credentials."});
        }
    });

    // add product 
    //only access for admins
    app.post('/api/products', (req, res) => {
    
        const token = req.cookies["auth-token"];
    
        if (token === tokenInCookies){
            const userPayload = verifyToken(token);
            if (userPayload.role == 'Admin') {
                const newProduct = new Product({
                    title: req.body.title,
                    price: req.body.price,
                    shortDesc: req.body.shortDesc,
                    longDesc: req.body.longDesc,
                    imgFile: req.body.imgFile,
                    })
        
                    newProduct.save((err) => {
                    err ? res.send(err) : res.json(newProduct)
                    });
                } else {
                    res.json({msg: 'Unauthorized'});
                }
        } else {
            res.json({msg: 'Please, log in'})
        }
    })

    //get all products
    app.get('/api/products', async (req, res) => {
      const allProducts = await Product.find({})
      res.json(allProducts)
    });

    //get product byId
    app.get('/api/products/:id', async (req, res) => {
      const getProduct = await Product.findById(req.params.id)
      res.json(getProduct)
    })

    //delete product byId
    app.delete('/api/products/:id', async (req, res) => {
        const token = req.cookies["auth-token"];
    
        if (token === tokenInCookies){
            const userPayload = verifyToken(token);
            if (userPayload.role == 'Admin') {
                const removeProduct = await Product.deleteOne({ _id: req.params.id });
                res.json(removeProduct);
            } else {
                res.json({msg: 'Unauthorized'})
            }
        } else {
            res.json({msg: "Please, log in"});
        }
    })

    //Update Product
    //insert function for valdition 
    app.patch('/api/products/:id', async (req, res) => {
        const token = req.cookies["auth-token"];
    
        if (token === tokenInCookies){
            const userPayload = verifyToken(token);
            if (userPayload.role == 'Admin') {
                const updateProduct = await Product.updateOne({ _id: req.params.id }, { $set: { price: req.body.price } })
                res.json(updateProduct);
            } else {
                res.json({msg: 'Unauthorized'})
            }
        } else {
            res.json({msg: "Please, log in"});
        }
    })

    //post orders
    app.post('/api/orders', (req, res) => {
        const token = req.cookies["auth-token"];
    
        if (token === tokenInCookies){
            const userPayload = verifyToken(token);

            const postOrder = new Order({
                        status: req.body.status,
                        items: req.body.items,
                        buyer: userPayload.userId,
                        orderValue: req.body.items.length
            });

            postOrder.save((err) => {
                if (err) console.error(err);
                res.json(postOrder);
            });

        } else {
            res.json({msg: "Please, log in"});
        }
    })

    //get all Orders
    app.get('/api/orders', async (req, res) => {
      const allOrders = await Order.find({})
      res.json(allOrders)
    })
  })
}




module.exports = { app, connection }