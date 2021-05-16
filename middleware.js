const isLoggedIn = (req,res,next)=>{
    
    if(!req.isAuthenticated()){
        req.flash('error','Login First');
        res.redirect('/login');
    }else{
        next();
    }
}

const profileCompleted = (req, res, next)=>{
    console.log(req.user);
    console.log("chcking mo b no : "+typeof req.user.mobileNo)
    console.log("----"+req.user.mobileNo.length);
    if(req.user.mobileNo && req.user.mobileNo.length>=10 ){
        console.log("if ke andar");
        next();
    }else{
        console.log("else ke andar");
        req.flash("error","Please complete your profile first");
        res.redirect( `/user/${req.user._id}`);
    }
}

module.exports ={
     isLoggedIn
    ,
    profileCompleted
}