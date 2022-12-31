const { MongoClient, ServerApiVersion } = require("mongodb");
const db = require("../config/db");
const auth = require("../middleware/auth");

module.exports = function (app) {
  app.get("/read", (req, res) => {
    getMovies().then(
      function (value) {
        res.send(asyncWrapper(value));
      },
      function (error) {
        res.send(error);
      }
    );
  });
  app.get("/read/:sorting", (req, res) => {
    getSortedMovies(req.params.sorting).then(
      function (value) {
        res.send(asyncWrapper(value));
      },
      function (error) {
        res.send(error);
      }
    );
  });

  app.get("/read/id/:id", (req, res) => {
    getMovieById(req.params.id).then(
      function (value) {
        res.send(asyncWrapper(value));
      },
      function (error) {
        res.send(asyncWrapper(error));
      }
    );
  });
  app.post(`/movies/add?`, (req, res) => {
    addMovie(req.query).then(
      function (value) {
        res.send(asyncWrapper(value));
      },
      function (error) {
        res.send(asyncWrapper(error));
      }
    );
  });
  app.delete("/movies/delete/:id?", auth, (req, res) => {
    console.dir(req);
    deleteMovieById(req.params.id).then(
      function (value) {
        res.send(asyncWrapper(value));
      },
      function (error) {
        res.send(asyncWrapper(error));
      }
    );
  });
  app.put("/movies/update/:id?", auth, (req, res) => {
    updateMovie(req.params.id, req.query).then(
      function (value) {
        res.send(asyncWrapper(value));
      },
      function (error) {
        res.send(asyncWrapper(error));
      }
    );
  });
};

function asyncWrapper(promiseValue) {
  let data = promiseValue;
  return data;
}
async function getMovies() {
  const client = new MongoClient(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  let movies = [];
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const col = client.db("movieDB").collection("movies");
    let curs = col.find({});
    await curs.forEach((movie) => movies.push(movie));
    movies.map((movie) => delete movie["_id"]);
    return movies;
  } catch (e) {
    return `{status: 405, error:true, message:${e}}`;
  } finally {
    await client.close();
    console.log("closing");
  }
}

async function getSortedMovies(param) {
  const client = new MongoClient(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  let sortedMovies = [];
  let curs;
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const col = client.db("movieDB").collection("movies");
    switch (param) {
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
    return `{'status': 200, 'data': ${JSON.stringify(sortedMovies)}}`;
  } catch (e) {
    return `{status: 405, error:true, message:${e}}`;
  } finally {
    await client.close();
    console.log("closing");
  }
}

async function getMovieById(id = 1) {
  let foundMovie = [];
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
    curs = col.find({ index: parseInt(id) });
    await curs.forEach((movie) => foundMovie.push(movie));
    delete foundMovie[0]["_id"];
    return `{'status':200, 'data':${JSON.stringify(foundMovie)}}`;
  } catch (e) {
    console.log(e);
    return `{status: 405, error:true, message:${e}}`;
  } finally {
    await client.close();
    console.log("closing");
  }
}

async function addMovie(params) {
  if (
    !params.title ||
    params.year.length != 4 ||
    !params.year ||
    !parseInt(params.year)
  ) {
    return `{
        status: 403,
        error: true,
        message: "you cannot create a movie without providing a title and a year",
      }`;
  } else {
    const client = new MongoClient(db.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1,
    });
    try {
      let rating;
      params.rating ? (rating = params.rating) : (rating = 4);
      await client.connect();
      console.log("Connected correctly to server");
      const col = client.db("movieDB").collection("movies");
      let data = {
        title: params.title,
        year: parseInt(params.year),
        rating: parseFloat(rating),
      };
      await col.insertOne(data);
      return JSON.stringify(data);
    } catch (e) {
      return e;
    } finally {
      await client.close();
      console.log("closing");
    }
  }
}

async function deleteMovieById(id) {
  let newMovieList = [];
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
    await col.deleteOne({ index: parseInt(id) });
    curs = col.find({});
    await curs.forEach((movie) => newMovieList.push(movie));
    newMovieList.map((movie) => delete movie["_id"]);
    return `{status:200, data: ${JSON.stringify({ newMovieList })}}`;
  } catch (e) {
    return `{status:404, error:true, message: ${e}}`;
  } finally {
    await client.close();
    console.log("closing");
  }
}

async function updateMovie(id, params) {
  let newMovieList = [];
  let curs;
  const client = new MongoClient(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  let fields = { title: "", year: 2003, rating: 4 };
  params.title ? (fields.title = params.title) : delete fields.title;
  params.year ? (fields.year = parseInt(params.year)) : delete fields.year;
  params.rating
    ? (fields.rating = parseInt(params.rating))
    : delete fields.rating;
  try {
    await client.connect();
    console.log("connected");
    const col = client.db("movieDB").collection("movies");
    await col.updateOne({ index: parseInt(id) }, { $set: fields });
    curs = col.find({});
    await curs.forEach((movie) => newMovieList.push(movie));
    newMovieList.map((movie) => delete movie["_id"]);
    return `{status:200, data:${JSON.stringify(newMovieList)}}`;
  } catch (e) {
    return e;
  } finally {
    await client.close();
    console.log("closing");
  }
}
