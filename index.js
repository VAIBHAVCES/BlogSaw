const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const {Blogs} = require('./models/blogs.js');
const {seed} = require('./seed.js'); 
const {blogsRout} = require('./router/blogs.js')
const app = express();
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const Passport = require('passport');
const bodyParser = require('body-parser')
const PassportLocal = require('passport-local');
const authRouter = require('./router/auth.js');
const passport = require('passport');
const User = require('./models/users.js');
const  isLoggedIn = require('./middleware.js');

mongoose.connect('mongodb://localhost/blogsaw', {useNewUrlParser: true, useUnifiedTopology: true ,useFindAndModify:false}).then(()=>{
    console.log("connected to db");
})
app.use(methodOverride('_method'));
app.use(session({
    secret:"iDontKnowSecret",
    resave:false,
    saveUninitialized:true
}));
app.use(flash());
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


app.set('view engine','ejs');
app.set('views' ,  path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname,'public')));
// seed();
app.use(passport.initialize())
app.use(passport.session());
passport.use(new PassportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})
app.use(blogsRout);
app.use(authRouter);

app.listen(3000,()=>{
    console.log("Listening or port : "+3000);
})
