const express = require('express')
const app = express()
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const db = mongoose.connection;

//Middleware
app.use(express.static('public'))
require('dotenv').config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//APi token
const payload = {
    userId: user._id, 
    role: "costumer",
    exp: (Date.now() / 1000) + (60 * 60)
}

const header = {
    algorithm: process.env.HEADER_ALG
}

const token = jwt.sign(payload, process.env.SECRET, header);

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  //Routes 

})

module.exports = app