const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const {Blogs} = require('./models/blogs.js');
const {seed} = require('./seed.js'); 
const {blogsRout} = require('./router/blogs.js')
const app = express();
const methodOverride = require('method-override');

const bodyParser = require('body-parser')

mongoose.connect('mongodb://localhost/blogsaw', {useNewUrlParser: true, useUnifiedTopology: true ,useFindAndModify:false}).then(()=>{
    console.log("connected to db");
})
app.use(methodOverride('_method'));
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


app.set('view engine','ejs');
app.set('views' ,  path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname,'public')));
// seed();

app.use(blogsRout);

app.listen(3000,()=>{
    console.log("Listening or port : "+3000);
})

