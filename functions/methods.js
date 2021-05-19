const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const createToken = (value) => {
  const payload = {
    userId: value._id, 
    role: value.role,
    exp: (Date.now() / 1000) + (60 * 60)
  }

  const header = {
    algorithm: process.env.HEADER_ALG
  }

  const token = jwt.sign(payload, process.env.SECRET, header);
  return token;
}


const hashGenerator = (passWord) => {
  const saltRounds = 10;
  const hash = bcrypt.hashSync(passWord, saltRounds);
  return hash
}

const deCryptHash = (passWord, hash) => {
  const showTheTruth = bcrypt.compare(passWord, hash)
  return showTheTruth
}

const verifyToken = (token) => {
  return jwt.verify(token, process.env.SECRET, (err, payload) => {
    if (err) return console.error(err);
    return payload;
  })
}

module.exports = { createToken, deCryptHash, hashGenerator, verifyToken }