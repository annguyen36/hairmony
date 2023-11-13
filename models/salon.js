const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const haircutSchema = new Schema({
    name: String,
    image: String,
    price: String,
    description: String,
    location: String
});

module.exports = mongoose.model('Haircut', haircutSchema);