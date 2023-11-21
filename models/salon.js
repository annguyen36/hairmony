const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')

const haircutSchema = new Schema({
    name: String,
    image: String,
    price: String,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

haircutSchema.post('findOneAndDelete', async function (params) {
    if(params){
        await Review.deleteMany({
            _id: {
                $in: params.reviews
            }
        })
    }
})
module.exports = mongoose.model('Haircut', haircutSchema);