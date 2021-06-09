// Managment of enviorment variables
if(process.env.NODE_ENV!='production'){
  const dotenv = require("dotenv");
  dotenv.config();
}
// Routing and server library 
const express = require("express");
// Mongoose for connecting mongo databse
const mongoose = require("mongoose");
const path = require("path");
// Model 
const { Blogs } = require("./models/blogs.js");
const { seed } = require("./seed.js");
// Server variable
const app = express();
// For creating diffetent types of requests AS PATCH AND DELETE
const methodOverride = require("method-override");
// For managing user's  login session 
const session = require("express-session");
// for displaying flash messages 
const flash = require("connect-flash");
// framework for authentication
// const Passport = require("passport");
// Parser for parsing the body from diffeten types of requests
const bodyParser = require("body-parser");
// Passport local- strategy  or local databases type authentication
const PassportLocal = require("passport-local");
// ROUTERS import from / Router 
const authRouter = require("./router/auth.js");
const { blogsRout } = require("./router/blogs.js");
const userRouter = require("./router/user.js");
const passport = require("passport");
const User = require("./models/users.js");
// MIDDLEWARE 
const isLoggedIn = require("./middleware.js");
// Connecting payment routes
const paymentRouter = require("./router/payment.js");
// Multer for uploading profile picture
const upload = require('./config/multer.js');
const {cloudinary,delteImageFromCloudinary,uploadImageFromURL} = require('./config/cloudinary.js');
// Using nodemailer framework for sending up a welcome mail
const sendRegisterationWelcomeMail= require('./config/nodemailer.js');
// Google startegy for integerating google authenrtication 
const GoogleStrategy = require("passport-google-oauth20").Strategy;
mongoose
  .connect(process.env.MONGO_LINK , {
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
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// console.log("serving: "+__dirname);   // testing purpouse
app.use(express.static(path.join(__dirname, "public")));
// seed(); // for seeding any intital data turn this on

// -------------------------------------- AUTHENTICATION ROUTERS AND MIDDLEWARES --------------------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  "google", 
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID_OAUTH,
      clientSecret: process.env.CLIENT_SECRET_OAUTH,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async function (accessToken, refreshToken, profile, done) {
     

      let resultTosend ={};
      try{  
        const userExist = await User.exists({email:profile["_json"]["email"]});
        // console.log("upploading path : "+profile["_json"]["path"]);
        // console.log("trying to print id :"+profile.id);
        const imageUploadRes = await uploadImageFromURL(profile["_json"]['picture']);
        // console.log("image uploaded status object");
        // console.log(imageUploadRes);
        const profileImgObj = {
            avatar:imageUploadRes.secure_url,
            cloudinary_id:imageUploadRes.public_id
        };
        if(userExist){
          // user already exosts in db so just login
          // also we need to update its profile picture on every login
          // because it may be possible that your user has changed google dp
            const getUserFromDB = await User.find({email:profile["_json"]["email"]});
            await delteImageFromCloudinary(getUserFromDB[0].cloudinary_id);
            await User.findOneAndUpdate({email:profile["_json"]["email"]},profileImgObj);
            // console.log("google uesr was already registered on website");
        }else{
            // register user in db 
            const newUserObj = {
              name:profile._json.name,
              email:profile["_json"]["email"],
              username:profile["_json"]["email"],
              ...profileImgObj
            }
            await User.insertMany(newUserObj);
            await sendRegisterationWelcomeMail(profile["_json"]["email"]);
            // console.log("google user registered succesfully");
  
        }
        
        // console.log("parsing refult to sen d");
        resultTosend = await User.find({email:profile["_json"]["email"]});
        profile=resultTosend[0];
        
        }catch(err){
          console.log(err);
        }
      
      return done(null, profile);
    }
  
  )
);
passport.use(new PassportLocal(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());​
passport.serializeUser(function (user, done) {
  // console.log("flow of control inside serialization ");
  done(null, user);
});

passport.deserializeUser(async function (user, done) {
  try{
    
    // console.log("flow of control inside deserialization");
    // console.log("trying to printer user in deserialization before update");
    // console.log(user);
    const{_id}= user;
    user = await User.findById(_id);
    
    // console.log("trying to printer user in deserialization after update");
    // console.log(user);
    done(null, user);
  
  }catch(err){
    done(err);
  }

}); 
// ----------------------------------------------END OF AUTH Region----------------------------------

// Connecting different Routers 
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

app.listen(process.env.PORT || 3000 , () => {
  console.log("Listening or port : " + 3000);
});