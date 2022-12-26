const express = require("express");
const app = express();
const port = 3000;
app.get("/", (req, res) => {
  res.send("ok");
});
app.listen(port, () => {
  console.log(`ok`);
});
app.get("/test", (req, res) => {
  res.send(`{status:200, message:"ok"}`);
});
app.get("/time", (req, res) =>
  res.send(
    `{status: 200 , message: ${JSON.stringify(new Date()).slice(12, 17)}}`
  )
);
app.get(`/hello/:id?`, (req, res) =>
  res.send(`{status: 200 , message: "hello", ${req.params.id}}`)
);
app.get(`/search?s=:id?`, (req, res) => {
  if(req.params.id != undefined){res.send(`{status:200, message:"ok", data:${req.params.id}}`)}
    else{ res.send(`{status:500, error:true, message:'you have to provide a search'}`);}
});