if (process.env.NODE_ENV !== "production") {  
    require('dotenv').config();  
}  

// MongoDB connection URLs 
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';  

const express = require('express');  
const path = require('path');  
const mongoose = require('mongoose');  
const ejsMate = require('ejs-mate');  
const session = require('express-session');  
const flash = require('connect-flash');  
const ExpressError = require('./utils/ExpressError');

const methodOverride = require('method-override');  
const passport = require('passport');  
const LocalStrategy = require('passport-local').Strategy;  
const User = require('./models/user');  
const MongoDBStore = require('connect-mongo')(session);  

const userRoutes = require('./routes/users');  
const campgroundRoutes = require('./routes/campgrounds');  
const reviewRoutes = require('./routes/reviews');  

// Connect to MongoDB  
mongoose.connect(dbUrl, {  
    useNewUrlParser: true,  
    useUnifiedTopology: true,  
});  

const db = mongoose.connection;  
db.on("error", console.error.bind(console, "connection error:"));  
db.once("open", () => {  
    console.log("Database connected");  
});  

const app = express();  

app.engine('ejs', ejsMate);  
app.set('view engine', 'ejs');  
app.set('views', path.join(__dirname, 'views'));  

app.use(express.urlencoded({ extended: true }));  
app.use(methodOverride('_method'));  
app.use(express.static(path.join(__dirname, 'public')));  

// Session store configurationss  
const store = new MongoDBStore({  
    url: dbUrl,  
    secret: 'thisshouldbeabettersecret!',  
    touchAfter: 24 * 60 * 60 // 24 hours  
});  

store.on("error", function (e) {  
    console.log("SESSION STORE ERROR", e);  
});  

// Session configuration  
const sessionConfig = {  
    store,  
    name: 'session',  
    secret: 'thisshouldbeabettersecret!',  
    resave: false,  
    saveUninitialized: true,  
    cookie: {  
        httpOnly: true,  
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week  
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week  
    }  
};  

app.use(session(sessionConfig));  
app.use(flash());  

app.use(passport.initialize());  
app.use(passport.session());  
passport.use(new LocalStrategy(User.authenticate()));  
passport.serializeUser(User.serializeUser());  
passport.deserializeUser(User.deserializeUser());  

app.use((req, res, next) => {  
    console.log(req.session);  
    res.locals.currentUser = req.user;  
    res.locals.success = req.flash('success');  
    res.locals.error = req.flash('error');  
    next();  
});  

// Routes  
app.use('/', userRoutes);  
app.use('/campgrounds', campgroundRoutes);  
app.use('/campgrounds/:id/reviews', reviewRoutes);  

app.get('/', (req, res) => {  
    res.render('home');  
});  

// 404 error handling  
app.all('*', (req, res, next) => {  
    next(new ExpressError('Page Not Found', 404));  
});  

// Error handling middleware  
app.use((err, req, res, next) => {  
    const { statusCode = 500 } = err;  
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';  
    res.status(statusCode).render('error', { err });  
});  

// Start server  
app.listen(3000, () => {  
    console.log('Serving on port 3000');  
});