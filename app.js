const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');

const hairsalons = require('./routes/hairsalons')
const reviews = require('./routes/reviews')

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/hairmony')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
})

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/salons', hairsalons)
app.use('/salons/:id/reviews', reviews)

app.get('/',(req,res) => {
    res.render('home')
})

// Error handling

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Note Found', 404))
})
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something Went Wrong"} = err
    if (!err.message) err.message = 'Oh no, something went wrong'
    res.status(statusCode).render('error', {err})
})


app.listen(3000, () => {
    console.log('serving on port 3000')
})