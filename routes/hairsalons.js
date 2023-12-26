const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Joi = require('joi');
const ExpressError = require('../utils/ExpressError');
const Salon = require('../models/salon');

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

router.get('/', async (req,res) => {
    const salons = await Salon.find({});
    res.render('salons/index', {salons})
})
router.get('/new', (req, res) => {
    res.render('salons/new');
})

router.post('/', validateSalon, catchAsync(async (req, res, next) => {
        // if(!req.body.salon) throw new ExpressError('Invalid Salon Data', 400)
        
        const salon = new Salon(req.body.salon);
        await salon.save();
        req.flash('success', 'Successfully made a new salon!') 
        res.redirect(`/salons/${salon._id}`)
    
}))

router.get('/:id', catchAsync(async(req, res) => {
    const salon  = await  Salon.findById(req.params.id).populate('reviews')
    if(!salon) {
        req.flash('error', 'Cannot find that salon!') 
        return res.redirect('/salons') 
    }
    res.render('salons/show', {salon})
}))

router.get('/:id/edit', catchAsync(async (req,res) => {
    const salon  = await Salon.findById(req.params.id)
    res.render('salons/edit', {salon})
}))

router.put('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const salon = await Salon.findByIdAndUpdate(id,{...req.body.salon});
    req.flash('success', 'Successfully uodated salon!') 
    res.redirect(`/salons/${salon._id}`)
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Salon.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a salon!') 
    res.redirect('/salons')
}))

module.exports = router;