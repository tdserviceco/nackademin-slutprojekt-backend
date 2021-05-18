const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
let payload;

const createToken = (value, secret) => {
  payload = {}
  return jwt.sign(payload, secret)
}


const hashGenerator = (myPlaintext) => {
  const saltRounds = 10;
  const hash = bcrypt.hashSync(myPlaintext, saltRounds);
  return hash
}

const deCryptHash = (myPlaintext, hash,) => {
  const showTheTruth = bcrypt.compare(myPlaintext, hash)
  return showTheTruth
}

module.exports = { createToken, deCryptHash, hashGenerator }