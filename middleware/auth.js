const jwt = require('jsonwebtoken');
require('dotenv').config()

module.exports= function auth(req, res, next) {
  let cookie = req.headers.cookie;
  let splitted=cookie.split('=');
 cookie=splitted[1]
 const isVeri = jwt.verify(cookie, process.env.TOKEN_SECRET)
 if(isVeri){
  next()
 } else{
  res.send('you are not authorized!')
 }
}