const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
require('dotenv').config()

const app = express();

app.use(expressLayouts);
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Routs
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
// app.get('/', (request, response) => {
// 	response.send("jhdf");
// })

app.listen(3000, () => {
	console.log("app is running");
})