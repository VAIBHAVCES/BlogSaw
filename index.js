// This is the google branch

if(process.env.NODE_ENV!='production'){
  const dotenv = require("dotenv");
  dotenv.config();
}

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

const paymentRouter = require("./router/payment.js");
const upload = require('./config/multer.js');

const sendRegisterationWelcomeMail= require('./config/nodemailer.js');

const {cloudinary,delteImageFromCloudinary,uploadImageFromURL} = require('./config/cloudinary.js');
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
// const parseUrl = express.urlencoded({ extended: false });
// const parseJson = express.json({ extended: false });
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));
// seed();

app.use(passport.initialize());
app.use(passport.session());
passport.use(
  "google", 
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID_OAUTH,
      clientSecret: process.env.CLIENT_SECRET_OAUTH,
      callbackURL: "http://localhost:3000/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      /*
     use the profile info (mainly profile id) to check if the user is registerd in ur db
     If yes select the user and pass him to the done callback
     If not create the user and then select <hi></hi>m and pass to callback
    */
      // here i am using email id to check either user exist in db or not
      // console.log("flow of control test - index.js / google strategy");

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

// });
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
app.listen(process.env.PORT || 3000 , () => {
  console.log("Listening or port : " + 3000);
});