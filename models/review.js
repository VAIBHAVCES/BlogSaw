const mongoose = require('mongoose');
const reviewSchema ={
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
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