const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const Salon = require('./models/salon');
const Review = require('./models/review');

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

const validateSalon = (req, res, next) => {
    const salonSchema = Joi.object({
        salon: Joi.object({
            name: Joi.string().required(),
            description: Joi.string().required(),
            location: Joi.string().required(),
            image: Joi.string().required()
        }).required()
    })
    const {error} = salonSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
const validateReview = (req, res, next) => {
    const reviewSchema = Joi.object({
        review: Joi.object({
            rating: Joi.number().required().min(1).max(5),
            body: Joi.string().required()
        }).required()
    })
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/',(req,res) => {
    res.render('home')
})

app.get('/salons', async (req,res) => {
    const salons = await Salon.find({});
    res.render('salons/index', {salons})
})
app.get('/salons/new', (req, res) => {
    res.render('salons/new');
})

app.post('/salons', validateSalon, catchAsync(async (req, res, next) => {
        // if(!req.body.salon) throw new ExpressError('Invalid Salon Data', 400)
        
        const salon = new Salon(req.body.salon);
        await salon.save();
        res.redirect(`/salons/${salon._id}`)
    
}))

app.get('/salons/:id', catchAsync(async(req, res) => {
    const salon  = await  Salon.findById(req.params.id).populate('reviews')
    res.render('salons/show', {salon})
}))

app.get('/salons/:id/edit', catchAsync(async (req,res) => {
    const salon  = await Salon.findById(req.params.id)
    res.render('salons/edit', {salon})
}))

app.put('/salons/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const salon = await Salon.findByIdAndUpdate(id,{...req.body.salon});
    res.redirect(`/salons/${salon._id}`)
}))

app.delete('/salons/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Salon.findByIdAndDelete(id);
    res.redirect('/salons')
}))

app.post('/salons/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const salon = await Salon.findById(req.params.id);
    const review = new Review(req.body.review);
    salon.reviews.push(review);
    await review.save();
    await salon.save();
    res.redirect(`/salons/${salon._id}`)
}))

app.delete('/salons/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Salon.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    res.redirect(`/salons/${id}`)
}))

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