const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
require('dotenv').config()
const auth=require('../middleware/auth')
module.exports = function(app, database){
    app.post('/signup', async (req,res) => {
        let isRegistered=false;
        database.map(user => {
            if(user.username===req.query.username){isRegistered=true}
        })
        if(isRegistered){
            res.send('username is already used')
        } else if (req.query.username && req.query.password) {
            let newUser={
                'username': req.query.username,
                'password': await bcrypt.hash(req.query.password, parseInt(process.env.SALT))
            }
            const fs = require("fs");
            let data = fs.readFileSync(process.env.DATABASEPATH);
            let dataJSON=JSON.parse(data)
            let index=dataJSON.users.length
            dataJSON.users.push(newUser)
            fs.writeFileSync(process.env.DATABASEPATH, JSON.stringify(dataJSON));
            let token = jwt.sign({
                username: newUser.username,
                userID: index
            }, process.env.TOKEN_SECRET ,{ expiresIn: '4h'})
            res.cookie('token',token,{ maxAge: 2 * 60 * 60 * 1000, httpOnly: true });
            res.send('account created')
        } else {
            res.send('you have to provide a username and a password')
        }
        
    })
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
       try{
        const fs = require("fs");
        let data = fs.readFileSync(process.env.DATABASEPATH);
        let dataJSON=JSON.parse(data)
         let isExact= await bcrypt.compare(req.query.password, dataJSON.users[res.locals.index].password)
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
       const fs = require("fs");
       let data = fs.readFileSync(process.env.DATABASEPATH);
       let dataJSON=JSON.parse(data)
        if(req.query.newPassword && req.query.newUsername){
            dataJSON.users[res.locals.index].password=await bcrypt.hash(req.query.newPassword, parseInt(process.env.SALT));
            dataJSON.users[res.locals.index].username= req.query.newUsername;
            res.send('updated your account');
        }
        else if(req.query.newUsername){
            dataJSON.users[res.locals.index].username= req.query.newUsername;
            res.send('updated your account');
        }
        else if(req.query.newPassword){
            dataJSON.users[res.locals.index].password=await bcrypt.hash(req.query.newPassword, parseInt(process.env.SALT));
            res.send('updated your account');
        }
        fs.writeFileSync(process.env.DATABASEPATH, JSON.stringify(dataJSON))
    })
}