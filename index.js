// This is the google branch



const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const { Blogs } = require("./models/blogs.js");
const { seed } = require("./seed.js");
const { blogsRout } = require("./router/blogs.js");
const app = express();
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const Passport = require("passport");
const bodyParser = require("body-parser");
const PassportLocal = require("passport-local");
const authRouter = require("./router/auth.js");
const passport = require("passport");
const User = require("./models/users.js");
const isLoggedIn = require("./middleware.js");
const userRouter = require("./router/user.js");
const dotenv = require("dotenv");
dotenv.config();
const paymentRouter = require("./router/payment.js");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
mongoose
  .connect("mongodb://localhost/blogsaw", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("connected to db");
  });
app.use(methodOverride("_method"));
app.use(
  session({
    secret: "iDontKnowSecret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// const parseUrl = express.urlencoded({ extended: false });
// const parseJson = express.json({ extended: false });
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));
// seed();
//********************************************************************************************************* */
// Define Passport Strategy At top before using it
passport.use(
  "google", //Strategy name was missing - Devansh //************************************************************************* */
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID_OAUTH,
      clientSecret: process.env.CLIENT_SECRET_OAUTH,
      callbackURL: "http://localhost:3000/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      /*
     use the profile info (mainly profile id) to check if the user is registerd in ur db
     If yes select the user and pass him to the done callback
     If not create the user and then select <hi></hi>m and pass to callback
    */
      // console.log(profile);
      return done(null, profile);
    }
  ),(req,res)=>{
    console.log(profile);
    console.log(req.user);
  }

);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new PassportLocal(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());​
passport.serializeUser(function (user, done) {
  /*
    From the user take just the id (to minimize the cookie size) and just pass the id of the user
    to the done callback

    PS: You dont have to do it like this its just usually done like this
    */
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  /*npm
    Instead of user this function usually recives the id 
    then you use the id to select the user from the db and pass the user obj to the done callback
    PS: You can later access this data in any routes in: req.user
    */
  done(null, user);
});
// app.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "/failed",
//     successRedirect: "https://www.google.co.in",
//     scope: ["profile"],// Scope was missing  /************************************************************************************* */
//   }),
//   function (req, res) {
//     // Successful authentication, redirect home.
//     res.redirect("/good");
//   }
// );
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});
app.use(blogsRout);
app.use(authRouter);
app.use(userRouter);
app.use(paymentRouter);
app.get("/testViews", (req, res) => {
  res.render("testViews");
});
app.listen(3000, () => {
  console.log("Listening or port : " + 3000);
});