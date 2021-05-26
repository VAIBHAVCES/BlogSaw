const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/users.js');
const sendMail = require('../config/nodemailer.js');
console.log("recieved status :");
const  isLoggedIn = require('../middleware.js');
// router.get('/tempUser', async(req,res)=>{

//     const newUser = new User({email:"vaibhavces@gmail.com", name:"Vaibhav Jain",username:"vaibhav123"});
//     const regUser = await User.register(newUser,"1234" );
//     console.log(req.user);
//     res.send(regUser);

// });

router.get("/failed",(req,res)=>{
    res.send("redirection failed");
})

router.get('/good', (req, res) =>{
    res.send(req.user);
});
// res.send(`Welcome mr ${req.user.displayName}!

//     ${req.user}
// `)

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' , successRedirect:"/blogs"}),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/good');
  }
);

router.get('/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login','profile', 'email'] }) ,
(request, accessToken, refreshToken, profile, done)=>{
  console.log(profile);
});


router.get("failed", (req,res)=>{
  res.send("failed");
})


router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success','Logged Out Successfully');
    res.redirect('/login');
})
router.get('/register',(req,res)=>{
    res.render('auth/register');
});

router.get('/login',(req,res)=>{
    res.render('auth/login.ejs');
});

router.post('/login',passport.authenticate('local', {
    failureRedirect:'/login',
    failureFlash:true
}),(req,res)=>{

        req.flash("success","User logged in successfully");
        res.redirect("/blogs"); 
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