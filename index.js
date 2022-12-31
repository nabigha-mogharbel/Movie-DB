const express = require("express");
const app = express();
const port = 3000;
app.use(express.json());
const usersJSON=require('./middleware/users.json')
require("./routes/movies_routes")(app);
require("./routes/user_routes")(app, usersJSON.users);
const bodyParser = require('body-parser');
const cookieParser=require('cookie-parser')
app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send('ok')
});
app.listen(port, () => {
  console.log(`ok`);
});