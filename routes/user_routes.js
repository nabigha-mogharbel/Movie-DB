const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
require('dotenv').config()
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
                    username: "",
                    userID: 1
                }, process.env.TOKEN_SECRET ,{ expiresIn: '4h'})
                res.cookie('token',token,{ maxAge: 2 * 60 * 60 * 1000, httpOnly: true });
                res.send('token created')
            }
            else{res.send('authorization failed, try to login again')}
        }
    })
}