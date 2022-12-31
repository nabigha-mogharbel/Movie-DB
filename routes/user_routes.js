const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
//$2b$10$1mmeKgA9KNqX6CuH5f2Exue1v/bSaeOXywxwrRfqhwQC9y2zM9CTK
require('dotenv').config()
const auth=require('../middleware/auth')
module.exports = function(app, database){
    app.post('/login', async (req,res) => {
       let i=-1;
       database.map( (user,index) => {
            if(req.query.username===user.username){i=index}})
        if(i===-1){
            res.send('username not found')
        }
        else{
            let isExact=await bcrypt.compare(req.query.password, database[i].password);
            if(isExact){
                let token = jwt.sign({
                    username: database[i].username,
                    userID: i
                }, process.env.TOKEN_SECRET ,{ expiresIn: '4h'})
                res.cookie('token',token,{ maxAge: 2 * 60 * 60 * 1000, httpOnly: true });
                res.send('token created')
            }
            else{res.send('authorization failed, try to login again')}
        }
    })
    app.delete('/user/delete', auth, async (req, res) => {
        let cookie = req.headers.cookie;
       let splitted=cookie.split('=');
       cookie=splitted[1]
       console.log(cookie)
       let isVeri= await jwt.verify(cookie, process.env.TOKEN_SECRET)
       try{
        const fs = require("fs");
        let data = fs.readFileSync('/home/nabigha/Desktop/Codi/Movie-DB/routes/users.json');
        let dataJSON=JSON.parse(data)
         let isExact= await bcrypt.compare(req.query.password, dataJSON.users[isVeri.userID].password)
        if(isExact){
            dataJSON.users.splice(1, 1);
            const fs=require('fs')
            fs.writeFileSync(process.env.DATABASEPATH, JSON.stringify(dataJSON));
            res.cookie('token', '', { maxAge: 2 * 60 * 60 * 1000, httpOnly: true })
            res.send('deleted your account')
        } else{
            res.send('wrong authentication')
        }
       }catch(e){
        res.send(e)
       }
       
    });
    app.post('/user/logout', async (req, res) => {
        res.cookie('token', '', { maxAge: 2 * 60 * 60 * 1000, httpOnly: true })
        res.send('logged out')
    })
    app.put('/user/update', auth, async (req,res) => {
        let cookie = req.headers.cookie;
        let splitted=cookie.split('=');
       cookie=splitted[1]
       const isVeri = jwt.verify(cookie, process.env.TOKEN_SECRET)
       const fs = require("fs");
       let data = fs.readFileSync(process.env.DATABASEPATH);
       let dataJSON=JSON.parse(data)
        if(req.query.newPassword){
            dataJSON.users[isVeri.userID]=await bcrypt.hash(req.query.newPassword, process.env.SALT)
        }
        if(req.query.newUsername){
            dataJSON.users[isVeri.userID].username= req.query.newUsername;
            res.send('updated your account');
        }
        fs.writeFileSync(process.env.DATABASEPATH, JSON.stringify(dataJSON))
    })
}