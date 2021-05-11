const mongoose = require('mongoose');
const blogSchema = new mongoose.Schema({
    heading:{
        type:String,
        required:true
    },
    sub_heading:{
        type:String,
        required:true
    },
    icon:{
        type:String,
        required:true
    },
    body_text:{
        type:String,
    },
    body_img:{
        type:String,
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    createdOn:{
        type:Date,
        default:Date.now
    },
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Review'
        }
    ]

  });   
  const Blogs = new mongoose.model('Blog',blogSchema);
  module.exports.Blogs= Blogs;