const express = require("express");
const app = express();
const port = 3000;
app.use(express.json());
require("./routes/note_routes")(app);
app.get("/", (req, res) => {
  res.send("ok");
});
app.listen(port, () => {
  console.log(`ok`);
});