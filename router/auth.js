const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/users.js');


// router.get('/tempUser', async(req,res)=>{

//     const newUser = new User({email:"vaibhavces@gmail.com", name:"Vaibhav Jain",username:"vaibhav123"});
//     const regUser = await User.register(newUser,"1234" );
//     console.log(req.user);
//     res.send(regUser);

// });
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
        const regUser = await User.register(newUser,req.body.password );
        req.flash('success',`${req.body.name} has been registered successfully`);
        res.redirect('/login');
    }catch(err){
        req.flash('error',err.message);
        res.redirect('/register');
    }

});

module.exports = router;