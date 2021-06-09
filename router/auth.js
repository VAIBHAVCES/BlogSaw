const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/users.js');
const sendMail = require('../config/nodemailer.js');
console.log("recieved status :");
const  isLoggedIn = require('../middleware.js');


// --------------UTILITIES FUNCTION TO BE USED---------------
async function createUserInDatabase(){

}
async function verifyUserExistInDatabaseOrNot(user){
    try{
        const resp = await User.find({"email" : user.username});    
        return true;
    }catch(err){
        await createUserInDatabase();
        return false;
    }
}
//----------------------------------------------------

router.get("/failed",(req,res)=>{
    req.flash("error","Some problem while google authentication ")
    res.redirect("/");
})

// ---------------------AUTHENTICATION ROUTERS HANDLE WITH CARE-------------------

router.get('/google/callback',function(req, res,next) {
    // Successful authentication, redirect home.
    console.log("inside router /google/callback");
    console.log(req.user);
    // res.redirect('/good');
    next();
  }, passport.authenticate('google', { failureRedirect: '/failed' , successRedirect:"/"}),
  
);

router.get('/google',(req,res,next)=>{
    console.log("inside router /google");
    next()
}, passport.authenticate('google',{ scope: ['https://www.googleapis.com/auth/plus.login','profile', 'email'] })
)


router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success','Logged Out Successfully');
    res.redirect('/login');
})
router.get('/register',(req,res)=>{
    res.render('auth/register');
});

router.get('/login',(req,res)=>{
    if(req.isAuthenticated())   res.redirect("/");
    else    res.render('auth/login.ejs');
});

router.post('/login',passport.authenticate('local', {
    failureRedirect:'/login',
    successRedirect:"/blogs",
    failureFlash:true,
    scope: ['https://www.googleapis.com/auth/plus.login','profile', 'email'] 

}),  
(req,res)=>{

        req.flash("success","User logged in successfully");
        res.redirect("/"); 
});


router.post('/register', async(req,res)=>{

    try{
        const newUser = new User({email:req.body.email , username:req.body.username , name:req.body.name});
        await sendMail(req.body.email);
        const regUser = await User.register(newUser,req.body.password );
        
        req.flash('success',`${req.body.name} has been registered successfully`);
        res.redirect('/login');
    }catch(err){
        req.flash('error',err.message);
        res.redirect('/register');
    }

});

module.exports = router;