const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CD_CLOUD_NAME,
    api_key: process.env.CD_API_KEY,
    api_secret: process.env.CD_API_SECRET

});

async function uploadImageFromURL(url){
    try{
        const result = await cloudinary.uploader.upload(url);
        return result;
    }catch(err){
        return err;
    }
}

async function delteImageFromCloudinary(cloud_id){
    try{
        if(cloud_id!=process.env.DEFAULT_IMG_ID)
            await cloudinary.uploader.destroy(cloud_id);
        else
            console.log("Cant delte default image");
    }catch(err){
        return err;
    }
}

module.exports = {
    cloudinary,
    delteImageFromCloudinary,
    uploadImageFromURL
      
} 