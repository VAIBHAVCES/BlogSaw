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

async function  registeruser(userInfo){

}

router.get("/failed",(req,res)=>{
    res.send("redirection failed");
})

router.get('/good', async (req, res) =>{
    console.log("good router");
    // UPTO THIS STEP YOU ARE GOOGLE AUTHETICATED 
    // NOW I WANT TO CHECK THAT EITHER YOU ARE A FIRST TIME USER OR 
    //  YOU ALREADY HAVE A ACCOUNT IF 

    // try{
        
    //     const userExist= await verifyUserExistInDatabaseOrNot(req.user);
    //     if(userExist){
    //         //login 
    //     }else{
    //         // registeration
    //     }

    //     console.log(typeof req.user.emails[0].value);
    //     req.user.username = req.user.emails[0].value;
    //     res.send(req.user);
    // }catch(err){

    // }
    // res.redirect("/blogs");

    res.send(req.user);
});
// res.send(`Welcome mr ${req.user.displayName}!

//     ${req.user}
// `)

router.get('/google/callback',function(req, res,next) {
    // Successful authentication, redirect home.
    console.log("inside router /google/callback");
    console.log(req.user);
    // res.redirect('/good');
    next();
  }, passport.authenticate('google', { failureRedirect: '/failed' , successRedirect:"/blogs"}),
  
);

router.get('/google',(req,res,next)=>{
    console.log("inside router /google");
    next()
}, passport.authenticate('google',{ scope: ['https://www.googleapis.com/auth/plus.login','profile', 'email'] })
)


// (request, accessToken, refreshToken, profile, done)=>{
//   console.log("inside router /google");
// });


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
    successRedirect:"/blogs",
    failureFlash:true,
    scope: ['https://www.googleapis.com/auth/plus.login','profile', 'email'] 

}),  


(req,res)=>{

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