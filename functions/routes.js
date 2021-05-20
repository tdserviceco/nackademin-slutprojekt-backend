let tokenInCookies = '';
const admin = 'admin';
const User = require('../models/user')
const Product = require('../models/product')
const Order = require('../models/order')
const { createToken, deCryptHash, hashGenerator, verifyToken } = require('./methods');

const register = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    const newUser = new User({
      email: req.body.email,
      name: req.body.name,
      password: hashGenerator(req.body.password),
      adress: req.body.adress
    });

    newUser.save((err) => {
      err ? res.status(403).send(err) : res.status(202).json(newUser)
    })
  }
  else {
    res.json({ msg: "Email already taken" });
  }
}

const auth = async (req, res, next) => {

  const user = await User.findOne({
    email: req.body.email
  });

  if (user === null) {
    res.status(403).json({ msg: "Login failed. Invalid credentials." })
  } else {
    let password = await deCryptHash(req.body.password, user.password)
    if (password) {
      const token = createToken(user);
      res.cookie('auth-token', token);
      tokenInCookies = token;
      const copyUser = await User.findOne(user).select(['-password']);

      res.status(202).json({
        token: token,
        user: copyUser
      });
    } else {
      res.status(403).json({ msg: "Login failed. Invalid credentials." });
    }
  }
};

const products = async (req, res, next) => {
  const token = req.cookies["auth-token"];

  if (token === tokenInCookies) {
    const userPayload = verifyToken(token);

    if (userPayload.role == admin) {
      const newProduct = new Product({
        title: req.body.title,
        price: req.body.price,
        shortDesc: req.body.shortDesc,
        longDesc: req.body.longDesc,
        imgFile: req.body.image,
        serial: req.body.serial
      })
      newProduct.save((err) => {
        err ? res.status(403).send(err) : res.status(202).json({ newProduct: newProduct });
      });
    } else {
      res.status(403).json({ msg: 'Unauthorized' });
    }
  } else {
    res.status(403).json({ msg: 'Please, log in' })
  }
}

const orders = async (req, res, next) => {

  const token = req.cookies["auth-token"];
  if (token === tokenInCookies) {
    const userPayload = verifyToken(token);

    const postOrder = new Order({
      status: req.body.status,
      items: req.body.items,
      buyer: userPayload.userId,
      orderValue: req.body.items.length
    });
    const orderValue = postOrder.items;
    let total = [];
    orderValue.forEach(element => {
      total.push(element.price)
    });
    console.log(total)
    console.log(orderValue)
    postOrder.save((err) => {
      if (err) console.error(err);
      res.status(202).json(postOrder);
    });

  } else {
    res.status(403).json({ msg: "Please, log in" });
  }

};

const allProducts = async (req, res, next) => {
  const products = await Product.find({})
  res.json(products)
}

const productById = async (req, res, next) => {
  const product = await Product.findById(req.params.id)
  res.json(product)
}

const removeProduct = async (req, res, next) => {
  const token = req.cookies["auth-token"];
  if (token === tokenInCookies) {
    const userPayload = verifyToken(token);
    if (userPayload.role == admin) {
      const removeProduct = await Product.deleteOne({ _id: req.params.id });
      res.json(removeProduct);
    } else {
      res.json({ msg: 'Unauthorized' })
    }
  } else {
    res.json({ msg: "Please, log in" });
  }
}

const updateProduct = async (res, req, next) => {
  const token = req.cookies["auth-token"];

  if (token === tokenInCookies) {
    const userPayload = verifyToken(token);
    if (userPayload.role == admin) {
      const updateProduct = await Product.updateOne({ _id: req.params.id }, { $set: { price: req.body.price } })
      res.json(updateProduct);
    } else {
      res.json({ msg: 'Unauthorized' })
    }
  } else {
    res.json({ msg: "Please, log in" });
  }
}


const allOrders = async (req, res, next) => {
  const token = req.cookies["auth-token"];
  if (token === tokenInCookies) {
    const userPayload = verifyToken(token);
    const orders = (userPayload.role == admin) ? await Order.find({}) : await Order.find({ buyer: userPayload.userId });
    res.json(orders);
  } else {
    res.json({ msg: "Please, log in" });
  }
}
module.exports = { register, auth, products, orders, allProducts, allOrders, productById, removeProduct, updateProduct }