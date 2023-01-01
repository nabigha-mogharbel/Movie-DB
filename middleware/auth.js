const jwt = require('jsonwebtoken');
require('dotenv').config()

module.exports= function auth(req, res, next) {
  let cookie = req.headers.cookie;
  if(cookie){
    let splitted=cookie.split('=');
    cookie=splitted[1];
    try{
      const isVeri = jwt.verify(cookie, process.env.TOKEN_SECRET)
      
      if(isVeri){
        if(req.originalUrl.includes('/user/update') || req.originalUrl.includes('/user/delete')){
          res.locals.index=isVeri.userID
          next()
        }
        else{
          next()
        }
      } else{
       res.send('you are not authorized!')
      }} catch(e){
       res.send('you are not logged in')
      }
  }
  else{res.send('you are not logged in')}
  console.log(req.originalUrl)
}