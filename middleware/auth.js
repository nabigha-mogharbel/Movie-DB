const jwt = require('jsonwebtoken');
require('dotenv').config()

module.exports= function auth(req, res, next) {
  let cookie = req.headers.cookie;
  let splitted=cookie.split('=');
 cookie=splitted[1]
 try{
 const isVeri = jwt.verify(cookie, process.env.TOKEN_SECRET)
 console.log(isVeri)
 if(isVeri){
  next()
 } else{
  res.send('you are not authorized!')
 }} catch(e){
  res.send('you are not logged in')
 }
}