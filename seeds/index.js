
const mongoose = require('mongoose');
const Salon = require('../models/salon');
const {salon_descriptions, salon_names} = require('./seedHelpers');
const cities = require('./cities');

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/hairmony')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
})

const sample = (array) => array[Math.floor(Math.random() * array.length)];


const seedDb = async () => {
    await Salon.deleteMany({});
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const salon = new Salon({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            description: `${sample(salon_descriptions)} `,
            name: `${sample(salon_names)} `,
            image: 'https://source.unsplash.com/collection/8709034'
        })
        await salon.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close()
});