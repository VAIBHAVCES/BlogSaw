const router = require('express').Router();
const User = require('../models/users.js');
const {Blogs} = require('../models/blogs.js');
const upload = require('../config/multer.js');
const cloudinary = require('../config/cloudinary.js');
const isLoggedIn = require('../middleware.js');

const path = require('path');

router.get("/user/:userId", async(req,res)=>{
    try{
        const user = await User.findById(req.params.userId); 
        
        // Parsin blogs written by this user
        const allBlogs = await Blogs.find({author:req.params.userId});
        res.render("user/showUser.ejs", {user,allBlogs});

    }catch(err){
        res.flash('error','Couldn"t get user ');
        res.redirect('/login');
    }
});

router.patch("/user/:userId/dp",upload.single('update'),async(req,res)=>{
    
    try{

        const result = await cloudinary.uploader.upload(req.file.path);
    
        // i didnt used update by id just because i also wanted to delete old image from database
        // await User.findByIdAndUpdate( req.params.userId, {$set :{ avatar:result.secure_url } } );
        const user = await User.findById(req.params.userId);
        
        if(user.cloudinary_id!=process.env.DEFAULT_IMG_ID){
            // this part ensures we delete old image else it will overfill our cloudinary 
            // also  checks that we dont delete default image by mistake
            await cloudinary.uploader.destroy(user.cloudinary_id);
        }
        user.cloudinary_id = result.public_id;
        user.avatar = result.secure_url;
        await user.save();
        req.flash('success','Profile picture updated successfully');

        res.redirect(`/user/${req.params.userId}`);


    }catch(err){
        req.flash('error','Image couldn"t uploaded' );
        res.redirect(`/user/${req.params.userId}`);
    }

});

router.get("/user/:userId/edit",isLoggedIn,async(req,res)=>{
    try{

        const user = await User.findById(req.params.userId);
        res.render("user/editUserDetails",{user});
    }catch(err){
        req.flash('error',err.message);
        res.redirect(`/user/${req.params.userId}`);
    }
}); 

router.patch("/user/:userId",isLoggedIn, async(req,res)=>{
    try{

        await User.findByIdAndUpdate(req.params.userId ,{
            mobileNo:req.body.mobileNo,
            about:req.body.about
        });
        req.flash('success','User profile updated successfully');
        res.redirect(`/user/${req.params.userId}`);
    }catch(err){
        req.flash('error', 'Profile couldn"t be updated '+err.message );
        res.redirect(`/user/${req.params.userId}`);
    }


}); 

module.exports = router;