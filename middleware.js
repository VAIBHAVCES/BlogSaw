const isLoggedIn = (req,res,next)=>{
    
    if(!req.isAuthenticated()){
        req.flash('error','Login First');
        res.redirect('/login');
    }else{
        next();
    }
}
module.exports = isLoggedIn;    