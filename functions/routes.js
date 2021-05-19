let tokenInCookies = '';

const User = require('../models/user')
const Product = require('../models/product')
const Order = require('../models/order')

const register = async (req, res, next) =>{
  console.log(req.body.email)
  const user = await User.findOne(
    {email: req.body.email});
  register(user)
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
next()
}

const auth = async (req, res, next)=> {
  res.send('hej')
}


module.exports = {register, auth}
