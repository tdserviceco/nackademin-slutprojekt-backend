const express = require('express')
const app = express()
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const db = mongoose.connection;
const User = require('./models/user')

//Middleware
app.use(express.static('public'))
require('dotenv').config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
 

  //Routes 
  app.post('/register', (req,res) => {
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


})



module.exports = app