const express = require('express')
const app = express()
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const {
    register, auth, products, orders,
    allProducts, allOrders, productById,
    removeProduct, updateProduct
} = require('./functions/routes')
const db = mongoose.connection;

//Middleware
app.use(express.static('public'))
require('dotenv').config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const connection = () => {
    mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {

        /** Routes with GET/POST/PATCH/DELETE */

        /** GET ROUTES */
        app.get('/api/products/:id', productById)
        app.get('/api/products', allProducts)
        app.get('/api/orders', allOrders)

        /** POST ROUTES */
        app.post('/api/products', products)
        app.post('/api/register', register)
        app.post('/api/auth', auth)
        app.post('/api/orders', orders)

        /** PATCH ROUTES */
        app.patch('/api/products/:id', updateProduct)

        /** DELETE ROUTES */
        app.delete('/api/products/:id', removeProduct)
    })
}
module.exports = { app, connection }