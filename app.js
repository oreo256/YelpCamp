const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas');
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');

const campgrounds = require('./routers/campgrounds');
const reviews = require('./routers/reviews');

mongoose.connect('mongodb://localhost:27017/farmStand', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDBコネクションOK!!!!')
    })
    .catch((err) => {
        console.log('MongoDBコネクションエラー!!!');
        console.log(err);
    });

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(detail => detail.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home')
})

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
});

// app.use('*',(req,res,next) => {
//     next(new ExpressError('ページが見つかりませんでした',404))
// })

app.use((req, res, next) => {
    next(new ExpressError('ページが見つかりませんでした', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = '問題が起きました'
    }
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('ポート3000でリクエスト待受中')
})

