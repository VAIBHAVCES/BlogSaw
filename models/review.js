const mongoose = require('mongoose');
const reviewSchema ={

    rating:{
        type:Number,
        required:true
    },
    comment:{
        type:String,
        required:true
    }

}

const Reviews = new mongoose.model('Review',reviewSchema);
module.exports.Reviews = Reviews;