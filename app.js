if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override');


const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoStore = require('connect-mongo');

//導入しようとしたけれど格闘してもうまく働かないので保留
// app.use(mongoSanitize());
const dbUrl = "mongodb://localhost:27017/farmStand";

const dbUrl1 = process.env.DB_URL;
const dbUrl2 = process.env.DB_URL_TEST;

// mongodb://localhost:27017/farmStand
// console.log(process.env.DB_URL)
// console.log(process.env.DB_URL_TEST)
mongoose.connect(dbUrl,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
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
app.use(express.static(path.join(__dirname, 'public')))


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: 'mysecret'
    },
    touchAfter: 24 * 3600
});

store.on('error',e => {
    console.log('セッションストアエラー',e);
})


// こんなところは覚えていなくていいからドキュメントを読んでできればいい
const sessionConfig = {
    store,
    name: 'session',
    secret: 'mysecret',
    resave: false,
    savaUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use(helmet())

const scriptSrcUrls = [
    'https://api.mapbox.com',
    'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
    'https://api.mapbox.com',
    'https://cdn.jsdelivr.net'
];
const connectSrcUrls = [
    'https://api.mapbox.com',
    'https://*.tiles.mapbox.com',
    'https://events.mapbox.com'
];
const fontSrcUrls = [];
const imgSrcUrls = [
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
    'https://images.unsplash.com'
];

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["blob:"],
        objectSrc: [],
        imgSrc: ["'self'", 'blob:', 'data:', ...imgSrcUrls],
        fontSrc: ["'self'", ...fontSrcUrls]
    }
}));



app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req, res) => {
    res.render('home')
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes)

//これは動画ではこれでやってるけどうまくいかなかったので下ので代用
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

