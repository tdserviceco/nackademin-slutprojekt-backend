let tokenInCookies = '';
const admin = 'admin';
const User = require('../models/user')
const Product = require('../models/product')
const Order = require('../models/order')
const { createToken, deCryptHash, hashGenerator, verifyToken } = require('./methods');

// Next är definierad men används aldrig, men finns med ifall det skulle behövas i framtiden av andra.

// Här registrerar man sitt användarkonto
const register = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }); // Försäkrar att användar adressen inte redan är tagen.

  if (!user) { // Ifall adressen INTE redan är registrerad, så kan den användas
    const newUser = new User({
      email: req.body.email,
      name: req.body.name,
      password: hashGenerator(req.body.password), // krypterar lösenordet
      adress: req.body.adress
    });
    newUser.save((err) => {
      const token = createToken(newUser);
      res.cookie('auth-token', token);
      tokenInCookies = token; // Gör en kopia på token, så den kan granskas i andra routes.
      err ? res.status(400).send(err) : res.status(202).json({user: newUser})
    })
  }
  else {
    res.status(400).send("Email already taken");
  }
}

const auth = async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email
  });

  if (!user) { // Försäkrar att användaren inte är icke-existerande (Null)
    res.status(400).send("Login failed. Invalid credentials.")

  }
  else {
    let password = await deCryptHash(req.body.password, user.password) //Kollar så att användarens krypterade lösenord matchar det angivna.

    if (password) {
      const token = createToken(user);
      res.cookie('auth-token', token);
      tokenInCookies = token; // Gör en kopia på token, så den kan granskas i andra routes.

      res.status(202).json({
        token: token,
        user: {
          name: user.name,
          role: user.role,
          adress: {
            street: user.adress.street,
            zip: user.adress.zip,
            city: user.adress.city
          }
        }
      });
    } else {
      res.status(400).send('Login failed. Invalid credentials.');
    }
  }
};

const products = async (req, res, next) => {
  const token = req.cookies["auth-token"];
  if (token === tokenInCookies) {
    const userPayload = verifyToken(token); // Verifierar token
    if (userPayload.role == admin) {
      const newProduct = new Product({
        title: req.body.title,
        price: req.body.price,
        shortDesc: req.body.shortDesc,
        longDesc: req.body.longDesc,
        imgFile: req.body.imgFile,
        serial: req.body.serial
      })
      newProduct.save((err) => {
        err ? res.status(400).send(err) : res.status(202).json({ product: newProduct }); //Fronted-delen letar efter ett objekt som kallas "product".
      });
    } else {
      res.status(400).send('Unauthorized');
    }
  } else {
    res.status(400).send('Please, log in')
  }
}

const orders = async (req, res, next) => {
  const token = req.cookies["auth-token"];
  if (token === tokenInCookies) {
    const userPayload = verifyToken(token);
    const postOrder = new Order({
      items: req.body.items,
      buyer: userPayload.userId,
      orderValue: 0
    });
    postOrder.save((err) => {
      if (err) console.error(err);
    });

    const getOrder = await Order.findById(postOrder._id).populated('items');

    const getItems = getOrder.items;

    let totalPrice = getItems.reduce((acc, current) => {
      return acc + current.price
    }, 0)
    const saveOrder = await Order.findByIdAndUpdate(postOrder._id, {$set:{orderValue: totalPrice}});
    const account = await User.findById(userPayload.userId);
    account.orderhistory.push(postOrder._id);
    account.save((err) => {
      console.log('save');
      err ? console.error(err) : res.status(202).json(saveOrder);
    });


    // const items = await Product.find({'_id': {$in: req.body.items}});
    //let items = await Product.find({ _id: { $in: req.body.items } });
    // En inbyggd forEach-loop som adderar ihop priset på alla items och ger ett totalpris
    
    /* for (let i = 0; i < req.body.items.length; i++){
      for (let j = 0; j < items.length; j++) {
        if(req.body.items[i] === String(items[j]._id)) {
          console.log(items._id, items.price);
        }
      }
    } */
    
  } else {
    res.status(400).send("Please, log in");
  }
};

// Hämtar alla produkter
const allProducts = async (req, res, next) => {
  const products = await Product.find({})
  res.json(products)
}

// Hämtar enskild produkt
const productById = async (req, res, next) => {
  const product = await Product.findById(req.params.id)
  res.json(product)
}

//Tar bort produkt
const removeProduct = async (req, res, next) => {
  const token = req.cookies["auth-token"];

  if (token === tokenInCookies) {
    const userPayload = verifyToken(token);
    if (userPayload.role == admin) {
      const removeProduct = await Product.deleteOne({ _id: req.params.id });
      res.json(removeProduct);
    } else {
      res.send('Unauthorized')
    }
  } else {
    res.send("Please, log in");
  }
}

// Updaterar produkt
const updateProduct = async (req, res, next) => {
  const token = req.cookies["auth-token"];
  if (token === tokenInCookies) {
    const userPayload = verifyToken(token);
    if (userPayload.role == admin) {
      const modifiedProduct = { ...req.body };
      delete modifiedProduct._id;
      delete modifiedProduct.__v;
      const updateProduct = await Product.updateOne({ _id: req.params.id }, { $set: modifiedProduct });
      res.json(updateProduct);
    } else {
      res.send('Unauthorized')
    }
  } else {
    res.send("Please, log in");
  }
}

// Hämtar alla beställningar
const allOrders = async (req, res, next) => {
  const token = req.cookies["auth-token"];
  if (token === tokenInCookies) {
    const userPayload = verifyToken(token);
    // Gör så att bara en Admin kan se alla beställningar, men en vanlig användare kan bara se sina egna beställningar.
    const orders = (userPayload.role === admin) ? await Order.find({}) : await Order.find({ buyer: userPayload.userId });
    res.json(orders);
  } else {
    res.send('Please, log in');
  }
}

module.exports = { register, auth, products, orders, allProducts, allOrders, productById, removeProduct, updateProduct }