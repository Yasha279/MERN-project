const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROHxYft1f_Ln_y_scKnh8-g5rLMmce7JKyPQ&s",
        },
        
        // set: (v) => v === ""
        //     ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROHxYft1f_Ln_y_scKnh8-g5rLMmce7JKyPQ&s"
        //     : v
    },
    price: {
        type: Number,
        required: true
    },
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId
        }
    ]
});

const Listing = mongoose.model("Listing", listingSchema)

module.exports = Listing;