const express = require("express");
const {isLoggedIn} = require("../middleware.js");
const router = express.Router();

const { Blogs } = require("../models/blogs.js");
const { Reviews } = require("../models/review.js");

router.get("/blogs", async (req, res) => {
  try {
    const dbBlogs = await Blogs.find().populate('author');
    // console.log(dbBlogs);
    res.render("blogs/blogs", { dbBlogs });
    // res.send(req.user);

  } catch (err) {
    req.flash("error", 'Couldn"t get all blogs page');
    res.render("partials/error");
  }
});



router.get("/blogs/new", isLoggedIn, async (req, res) => {
  try {
    res.render("blogs/new");
  } catch (err) {
    req.flash("error", 'Couldn"t get new blogs page');
    res.render("partials/error");
  }
});

router.post("/blogs/new", async (req, res) => {
  try {
    
    const newBlogBody  = { ...req.body , author:req.user.id};
    await Blogs.insertMany(newBlogBody);
    req.flash("success", "New blog added page ");
    res.redirect("/blogs");
  } catch (err) {
    req.flash("error", "New blog cant be added");
    res.render("partials/error");
  }
});

router.get("/blogs/:id/user/:userId", isLoggedIn ,async (req, res) => {
  try {
    const blog = await Blogs.findById(req.params.id);
    res.render("blogs/update", { blog });
  } catch (err) {
    req.flash("error", 'Couldn"t get updated page');
    res.render("partials/error");
  }
});

router.patch("/blogs/:id/user/:userId", async (req, res) => {
  try {
    console.log("inside patchh route");
    await Blogs.findByIdAndUpdate(req.params.id, {...req.body , author:req.params.userId });
    req.flash("success", "blogs updated successfully");
    res.redirect("/blogs");
  } catch (err) {
    req.flash("error", 'blog couldn"t be updated ');
    res.render("partials/error");
  }
});
router.delete("/blogs/:id/user/userId", isLoggedIn ,async (req, res) => {
  try {
    await Blogs.findByIdAndDelete(req.params.id);
    req.flash("success", "blog dropped successfully");
    res.redirect("/blogs");
  } catch (err) {
    req.flash("error", 'blog couldn"be deleted ');
    res.render("partials/error");
  }
});
router.post("/blogs/:id/user/:userId/review", isLoggedIn, async (req, res) => {
  try {
    const review = await new Reviews({ ...req.body, user: req.user._id });
    const updatedBlog = await Blogs.findById(req.params.id);
    review.save();
    updatedBlog.reviews.push(review);
    updatedBlog.save();
    req.flash("success", "Review added ");
    res.redirect(`/blogs/${req.params.id}`);
  } catch (err) {
    req.flash("error", "Review could not be created ");
    res.render("partials/error");
  }
});

router.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await Blogs.findById(req.params.id).populate(["author","reviews"]);

    const newReviewlist = blog.reviews;
    const allReviews = [];
    for (let item of newReviewlist) {
      const temp = await Reviews.findById(item._id).populate("user");
      allReviews.push(temp);
    }
    // console.log(allReviews);
    res.render("blogs/show", { blog, allReviews });

  } catch (err) {
    req.flash("error", "Invalid id please enter a valid id");
    res.redirect("/error");
  }
});

router.delete("/blogs/:id/review/:reviewId", async (req, res) => {
  const blog = await Blogs.findById(req.params.id);
  blog.reviews = blog.reviews.filter((value, index, arr) => {
    return value._id != req.params.reviewId;
  });
  blog.save();
  await Reviews.findByIdAndDelete(req.params.reviewId);
  res.redirect(`/blogs/${req.params.id}`);
});

router.get("/error", (req, res) => {
  res.status(500).render("partials/error");
});

module.exports.blogsRout = router;
