let tokenInCookies = '';

const User = require('../models/user')
const Product = require('../models/product')
const Order = require('../models/order')
const { createToken, deCryptHash, hashGenerator, verifyToken } = require('./methods');
const { response } = require('express');




const register = async (req, res, next) =>{
  console.log(req.body.email)
  const user = await User.findOne(
    {email: req.body.email});
  
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

}

const auth = async (req, res, next)=> {
  
    const user = await User.findOne({ 
      email: req.body.email
        });
        if(user === null){
          res.status(403).send('no one with that mail')
        }else{
          let password = await deCryptHash(req.body.password, user.password).then(response =>{ return response})
      if(password) {
            const token = createToken(user);
            res.cookie('auth-token', token);
            tokenInCookies = token;
            res.json({msg: "You're logged in!"});
        } else {
            res.status(403).json({msg: "Login failed. Invalid credentials."});
        }
        }

         
       
      };



const products = async (req, res, next) =>{
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
} 

const orders = async (req, res, next) =>{
  
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

};





module.exports = {register, auth, products, orders }
