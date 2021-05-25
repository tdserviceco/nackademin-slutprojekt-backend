let tokenInCookies = '';
const admin = 'admin';
const User = require('../models/user')
const Product = require('../models/product')
const Order = require('../models/order')
const { createToken, deCryptHash, hashGenerator, verifyToken } = require('./methods');

// Next är definierad men används aldrig, men finns med ifall det skulle behövas i framtiden av andra.

// Här registrerar man sitt användarkonto
const register = async (req, res, next) => {
  const user = await User.findOne({ 'user.email': req.body.email }); // Försäkrar att användar adressen inte redan är tagen.

  if (!user) { // Ifall adressen INTE redan är registrerad, så kan den användas
    const newUser = new User({
      user: {
        email: req.body.email,
        name: req.body.name,
        password: hashGenerator(req.body.password), // krypterar lösenordet
        adress: req.body.adress
      }
    });
    newUser.save((err) => {
      err ? res.status(403).send(err) : res.status(202).json(newUser)
    })
  }
  else {
    res.status(403).send("Email already taken");
  }
}

const auth = async (req, res, next) => {
  const account = await User.findOne({
    'user.email': req.body.email
  });

  if (!account) { // Försäkrar att användaren inte är icke-existerande (Null)
    res.status(403).send("Login failed. Invalid credentials.")

  }
  else {
    let password = await deCryptHash(req.body.password, account.user.password) //Kollar så att användarens krypterade lösenord matchar det angivna.

    if (password) {
      const token = createToken(account);
      res.cookie('auth-token', token);
      tokenInCookies = token; // Gör en kopia på token, så den kan granskas i andra routes.

      /** Vi kopierar ny användare och sedan exkluderar 
       *  password-fältet för vi vill inte visa 
       *  den på frontend delen. 
       * */
      const copyAccount = await User.findOne({ 'user.email': account.user.email }).select(['-password']);
      res.status(202).json({
        token: token,
        user: {
          name: copyAccount.user.name,
          role: copyAccount.user.role,
          adress: {
            street: copyAccount.user.adress.street,
            zip: copyAccount.user.adress.zip,
            city: copyAccount.user.adress.city
          }
        }
      });
    } else {
      res.status(403).send('Login failed. Invalid credentials.');
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
        err ? res.status(403).send(err) : res.status(202).json({ product: newProduct }); //Fronted-delen letar efter ett objekt som kallas "product".
      });
    } else {
      res.status(403).send('Unauthorized');
    }
  } else {
    res.status(403).send('Please, log in')
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

    const getOrder = await Order.findById(postOrder._id).populate('items') // Hämtar samma order-objekt efter att den sparats
    const getItems = getOrder.items
    // En inbyggd forEach-loop som adderar ihop priset på alla items och ger ett totalpris
    let totalPrice = getItems.reduce((acc, current) => {
      return acc + current.price
    }, 0)
    const saveOrder = await Order.findByIdAndUpdate(postOrder._id, { $set: { orderValue: totalPrice } });
    const account = await User.findById(userPayload.userId);
    account.user.orderhistory.push(postOrder._id); // Updaterar användarens order history.
    account.save((err) => {
      err ? console.error(err) : res.status(202).json(saveOrder)
    })
  } else {
    res.status(403).send("Please, log in");
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