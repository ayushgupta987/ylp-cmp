const mongoose = require('mongoose');  
const Review = require('./review');  
const Schema = mongoose.Schema;  

const ImageSchema = new Schema({  
    url: { type: String, required: true },  
    filename: { type: String, required: true }  
});  

ImageSchema.virtual('thumbnail').get(function () {  
    return this.url.replace('/upload', '/upload/w_200');  
});  

const opts = { toJSON: { virtuals: true }, strictPopulate: false };  

const CampgroundSchema = new Schema({  
    title: { type: String, required: true }, // Make title required  
    images: [ImageSchema],  
    geometry: {  
        type: {  
            type: String,  
            enum: ['Point'],  
            required: true  
        },  
        coordinates: {  
            type: [Number],  
            required: true  
        }  
    },  
    price: { type: Number, required: true, min: 0 }, // Make price required with a minimum value  
    description: { type: String, required: true }, // Make description required  
    location: { type: String, required: true }, // Make location required  
    author: {  
        type: Schema.Types.ObjectId,  
        ref: 'User',  
        required: true // Ensure the author field is populated  
    },  
    reviews: [  
        {  
            type: Schema.Types.ObjectId,  
            ref: 'Review'  
        }  
    ]  
}, opts);  

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {  
    return `  
        <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>  
        <p>${this.description.substring(0, 20)}...</p>`;  
});  

CampgroundSchema.post('findOneAndDelete', async function (doc) {  
    if (doc) {  
        await Review.deleteMany({  
            _id: { $in: doc.reviews }  
        });  
    }  
});  

module.exports = mongoose.model('Campground', CampgroundSchema);