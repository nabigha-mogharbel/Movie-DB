require('dotenv').config()
module.exports = {  url : `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.c4flmvu.mongodb.net/?retryWrites=true&w=majority`};