const router = require('express').Router();
const User = require('../models/users.js');
const {Blogs} = require('../models/blogs.js');
const upload = require('../config/multer.js');
const {cloudinary, delteImageFromCloudinary} = require('../config/cloudinary.js');
const {isLoggedIn} = require('../middleware.js');

const path = require('path');
// For viewing a persons profilr without even logging in with no change access
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

// Router for updating profile image of any account 
router.patch("/user/:userId/dp",isLoggedIn, upload.single('update'),async(req,res)=>{
    
    // try{

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


    // }catch(err){
    //     req.flash('error','Image couldn"t uploaded' );
    //     res.redirect(`/user/${req.params.userId}`);
    // }

});
// Router for deleting profile image of any account 
router.delete("/user/:userId/dp",isLoggedIn ,async(req,res)=>{
    try{
        const updateThis = {
            avatar:process.env.DEFAULT_IMG,
            cloudinary_id:process.env.DEFAULT_IMG_ID
        }
        const userImageToUpdated = await User.findById(req.params.userId);
        await User.findByIdAndUpdate(req.params.userId,updateThis);
        console.log("deleteing : "+userImageToUpdated.cloudinary_id);
        await delteImageFromCloudinary(userImageToUpdated.cloudinary_id)
        req.flash("success","Image has been removed suuccessfully");
        res.redirect(`/user/${req.params.userId}`);

    }catch(err){
        req.flash("error","Image could't be uploaded because "+err );
    }   
});
// Router for getting the edit page for a particular user
router.get("/user/:userId/edit",isLoggedIn,async(req,res)=>{
    try{

        const user = await User.findById(req.params.userId);
        res.render("user/editUserDetails",{user});
    }catch(err){
        req.flash('error',err.message);
        res.redirect(`/user/${req.params.userId}`);
    }
}); 

// Router for updating a user's profile this router called on submission of prev form router
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
// Router for displaying all users in Our Top Contributors Page
router.get("/users",async(req,res)=>{
    const blogs = await Blogs.find({});
    const fmap ={};
    blogs.forEach((item)=>{
        if(fmap[item.author] ){
            fmap[item.author]++;
        }else{
            fmap[item.author]=1;
        }
    });
    
    const users = await User.find({});
    
    res.render("blogs/contributors.ejs",{users,fmap});
});
// if logged in user follows another user 
router.post("/user/follows/:person", isLoggedIn ,async(req,res)=>{
    try{
        const userId = req.user._id;
        const followerPerson = await User.findById(userId);
        const followingPerson = await User.findById(req.params.person);
        followerPerson.following.push(followingPerson._id);
        followingPerson.followers.push(followerPerson._id);
        await followerPerson.save();
        await followingPerson.save();
        res.redirect(`/user/${req.params.person}`);
        
    }catch(err){
        req.flash("error","Some problem in following user : Contact Admin");
        res.redirect(`/user/${req.params.person}`);
        
    }
});
// Unfollowing a user from logged in accountr

router.post("/user/unfollows/:person",isLoggedIn ,async(req,res)=>{

    try{
        
        const userId = req.user._id;
        const followerPerson = await User.findById(userId);
        const followingPerson = await User.findById(req.params.person);
        followerPerson.following = followerPerson.following.filter(item=>!item.equals(followingPerson._id));
        const temp =followingPerson.followers.filter(item=> !item.equals(followerPerson._id));
        followingPerson.followers=temp;
        await followerPerson.save();
        await followingPerson.save();
        res.redirect(`/user/${req.params.person}`);
    }catch(err){
        req.flash('error','');
    }
});


module.exports = router;