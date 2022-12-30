const { MongoClient, ServerApiVersion } = require("mongodb");
const db = require("../config/db");

module.exports = function (app) {
  app.get('/read', (req,res) => {
    getMovies().then(
      function(value) {res.send(asyncWrapper(value));},
      function(error) {res.send((error));}
    )
  }
  )
  app.get("/read/:sorting", async (req, res) => {
    let sortedMovies = [];
    let curs;
    const client = new MongoClient(db.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1,
    });
    try {
      await client.connect();
      console.log("Connected correctly to server");
      const col = client.db("movieDB").collection("movies");
      switch (req.params.sorting) {
        case "by-date":
          curs = col.find({}).sort({ year: 1 });
          break;
        case "by-title":
          curs = col.find({}).sort({ title: 1 });
          break;
        case "by-rating":
          curs = col.find({}).sort({ rating: -1 });
          break;
      }
      await curs.forEach((movie) => sortedMovies.push(movie));
      sortedMovies.map((movie) => delete movie["_id"]);
      res.send(`{'status': 200, 'data': ${JSON.stringify(sortedMovies)}}`);
    } catch (e) {
      res.send(`{status: 405, error:true, message:${e}}`);
    } finally {
      await client.close();
      console.log("closing");
    }
  });

  app.get("/read/id/:id", async (req, res) => {
    let foundMovie = [];
    let curs;
    const client = new MongoClient(db.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1,
    });
    try {
      await client.connect();
      const col = client.db("movieDB").collection("movies");
      curs = col.find({ index: parseInt(req.params.id) });
      await curs.forEach((movie) => foundMovie.push(movie));
      res.send(`{'status':200, 'data':${JSON.stringify(foundMovie)}}`);
    } catch (e) {
      console.log(e);
      res.send(`{status: 405, error:true, message:${e}}`);
    } finally {
      await client.close();
      console.log("closing");
    }
  });
  app.post(`/movies/add?`, async (req, res) => {
    let fields = req.query;
    if (
      !fields.title ||
      fields.year.length != 4 ||
      !fields.year ||
      !parseInt(fields.year)
    ) {
      res.send(`{
        status: 403,
        error: true,
        message: "you cannot create a movie without providing a title and a year",
      }`);
    } else {
      const client = new MongoClient(db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverApi: ServerApiVersion.v1,
      });
      try {
        let rating;
        fields.rating ? (rating = fields.rating) : (rating = 4);
        await client.connect();
        const col = client.db("movieDB").collection("movies");
        let data = {
          title: fields.title,
          year: parseInt(fields.year),
          rating: parseFloat(rating),
        };
        await col.insertOne(data);
        res.send(JSON.stringify(data));
      } catch (e) {
        console.log(e);
      } finally {
        await client.close();
        console.log("closing");
      }
    }
  });
  app.delete("/movies/delete/:id?", async (req, res) => {
    let newMovieList = [];
    let curs;
    const client = new MongoClient(db.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1,
    });
    try {
      await client.connect();
      console.log("connected");
      const col = client.db("movieDB").collection("movies");
      await col.deleteOne({ index: parseInt(req.params.id) });
      curs = col.find({});
      await curs.forEach((movie) => newMovieList.push(movie));
      newMovieList.map((movie) => delete movie["_id"]);
      res.send(`{status:200, data: ${JSON.stringify({ newMovieList })}}`);
    } catch (e) {
      console.log(e);
    } finally {
      await client.close();
      console.log("closing");
    }
  });
  app.put("/movies/update/:id?", async (req, res) => {
    let newMovieList = [];
    let curs;
    const client = new MongoClient(db.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1,
    });
    let fields = { title: "", year: 2003, rating: 4 };
    req.query.title ? (fields.title = req.query.title) : delete fields.title;
    req.query.year
      ? (fields.year = parseInt(req.query.year))
      : delete fields.year;
    req.query.rating
      ? (fields.rating = parseInt(req.query.rating))
      : delete fields.rating;
    try {
      await client.connect();
      console.log("connected");
      const col = client.db("movieDB").collection("movies");
      await col.updateOne({ index: parseInt(req.params.id) }, { $set: fields });
      curs = col.find({});
      await curs.forEach((movie) => newMovieList.push(movie));
      newMovieList.map((movie) => delete movie["_id"]);
      res.send(`{status:200, data:${JSON.stringify(newMovieList)}}`);
    } catch (e) {
      console.log(e);
    } finally {
      await client.close();
      console.log("closing");
    }
  });
};
function asyncWrapper(promiseValue){
  let data=promiseValue;
  return data
}
async function getMovies( ) {
  const client = new MongoClient(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  let movies=[];
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const col = client.db("movieDB").collection("movies");
    let curs = col.find({});
    await curs.forEach((movie) => movies.push(movie));
    movies.map((movie) => delete movie["_id"]);
    return(movies);
  } catch (e) {
    return(`{status: 405, error:true, message:${e}}`)
  } finally {
    await client.close();
    console.log("closing");
  }
}