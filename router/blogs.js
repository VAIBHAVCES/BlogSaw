const express = require('express');
const router = express.Router();

const {Blogs}= require('../models/blogs.js');
const {Reviews} =require('../models/review.js');



router.get("/blogs", async(req,res)=>{

    const dbBlogs =await Blogs.find();
    res.render('blogs/blogs',{dbBlogs});
});

router.get("/blogs/new", async(req,res)=>{
    res.render('blogs/new');
});

router.post("/blogs/new", async(req,res)=>{

    await Blogs.insertMany(req.body);
    res.redirect('/blogs');
});

router.get("/blogs/:id/update", async(req,res)=>{
    const blog = await Blogs.findById(req.params.id);
    res.render('blogs/update',{blog});
});

router.patch("/blogs/:id", async(req,res)=>{
    await Blogs.findByIdAndUpdate(req.params.id , req.body);
    res.redirect('/blogs');
});
router.delete("/blogs/:id", async(req,res)=>{
    await Blogs.findByIdAndDelete(req.params.id);
    res.redirect('/blogs');
});
router.post("/blogs/:id/review",async(req,res)=>{
    console.log("about to add review");
    console.log(req.body);
   
    const review = await new Reviews(req.body);
    const updatedBlog=await Blogs.findById(req.params.id);
    updatedBlog.reviews.push(review);
    review.save();
    updatedBlog.save();
    res.redirect(`/blogs/${req.params.id}`);

});


router.get("/blogs/:id", async(req,res)=>{
    const blog = await Blogs.findById(req.params.id).populate('reviews');
    const allReviews = blog.reviews;
    res.render('blogs/show',{blog,allReviews});
});




module.exports.blogsRout = router;