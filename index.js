const express = require("express");
const app = express();
const port = 3000;
let movies = [
    { title: 'Jaws', year: 1975, rating: 8 },
    { title: 'Avatar', year: 2009, rating: 7.8 },
    { title: 'Brazil', year: 1985, rating: 8 },
    { title: 'الإرهاب والكباب', year: 1992, rating: 6.2 }
];
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
app.post('/create?', (req,res) => res.send(`{status: 200, message: 'create'}`))
app.get('/read', (req,res) => res.send(`{'status': 200, 'message': ${JSON.stringify(movies)}}`));
app.get('/read/by-date', (req,res) => res.send(`{'status': 200, 'data': ${sortMovies('year')}}`))
app.get('/read/by-rating', (req,res) => res.send(`{'status': 200, 'data': ${sortMovies('rating')}}`))
app.get('/read/by-title', (req,res) => res.send(`{'status': 200, 'data': ${sortMovies('title')}}`))
app.get('/read/id/:id', (req,res) => res.send(findMovie(req.params.id)))
app.put('/update?', (req,res) => res.send(`{status: 200, message: 'update'}`))
app.delete('/delete?', (req,res) => res.send(`{status: 200, message: 'delete'}`))
app.post(`/movies/add?title=:title&year=:year&rating=:rating?`, (req,res) => res.send(addMovie(req.params.title, req.params.year, req.params.rating)))
app.delete('/movies/delete/:id?', (req,res) => res.send(deleteMovie(req.params.id)))
app.put('/movies/update/:id?title=:title?&rating=:rating?&year=:year?', (req,res) => res.send(updateMovie(req.params)))
function sortMovies(param){
    let sortedMovies;
    if(param==='title'){
        sortedMovies= movies.sort((a,b) => {
            const nameA = a['title'].toUpperCase();
            const nameB = b['title'].toUpperCase();
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }          
            return 0;
          })
    } else{
        sortedMovies= movies.sort((a,b) => b[param ]- a[param]);
    }
    return JSON.stringify(sortedMovies)
}
const findMovie= (id) => {
  let msg;
  id<=movies.length-1? msg={'status': 200, 'data': movies[id]}: msg={'status': 404, 'error': `The movie ${id} does not exist`}
  return JSON.stringify(msg)
}

const addMovie=(title,year,rating=4)=>{
  let msg;
  if(!title || year.length!=4 || !year || !parseInt(year)){
    msg={status:403, error:true, message:'you cannot create a movie without providing a title and a year'}
  }else{
    movies.push({title: title, year:year, rating:rating})
    msg=movies
  }
  return JSON.stringify(msg)
}
const deleteMovie=(id)=> {
  let msg;
  if(id && id<movies.length){
    movies.splice(parseInt(id),1)
    msg=movies
  }
  else{msg={'status':403, 'error': true, 'message':`the movie ${id} does not exist`}}
  return JSON.stringify(msg)
}
const updateMovie=(params) => {
  //params=JSON.parse(params);
  let index;
  params.id==='0'? index=0 : index=parseInt(params.id)
  delete params.id
  let keyValues=Object.entries(params);
  keyValues.map(attribute => {
    switch (attribute[0]){
      case 'year':
      case 'rating':
        movies[index][attribute[0]]=parseInt(attribute[1])
        break;
      case 'title':
        movies[index][attribute[0]]=attribute[1]
        break;
    }
  })

 return JSON.stringify(movies)
}