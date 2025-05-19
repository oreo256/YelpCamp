module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','ログインしてください');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}











// たぶんかってにcursorにつくられたけどここからしたコメントアウトしても動くからこのままにしとくわ、一応コメントアウトで残してはおくからなんかあったら


// const { campgroundSchema, reviewSchema } = require('./schemas');
// const ExpressError = require('./utils/ExpressError');

// const validateCampground = (req, res, next) => {
//     const { error } = campgroundSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(detail => detail.message).join(',');
//         throw new ExpressError(msg, 400);
//     } else {
//         next();
//     }
// }

// const validateReview = (req, res, next) => {
//     const { error } = reviewSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(detail => detail.message).join(',');
//         throw new ExpressError(msg, 400);
//     } else {
//         next();
//     }
// }

// module.exports = { validateCampground, validateReview }; 