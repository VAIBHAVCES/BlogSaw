const mongoose = require('mongoose');
const PassportLocalMongoose = require('passport-local-mongoose');
const dotenv = require('dotenv');
dotenv.config();


const UserSchema = new mongoose.Schema({

    email:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    about:{
        type:String,
        default:"Hey there I am on whatsapp!"
    },
    mobileNo:{
        type:String
    },
    followers:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
        }
    ],
    following:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
        }
    ],
    avatar:{
        type:String,
        default:process.env.DEFAULT_IMG
    },
    cloudinary_id:{
        type:String,
        default:process.env.DEFAULT_IMG_ID
    }
})

UserSchema.plugin(PassportLocalMongoose);
const User = new mongoose.model('User',UserSchema);
module.exports = User;