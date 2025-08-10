const mongoose = require('mongoose');
const Joi = require('joi');

const RestaurantSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['close', 'open'],
        default: 'open'
    }
});

const restaurantJoiSchema = Joi.object({
    name: Joi.string().required(),
    logo: Joi.string().required(),
    status: Joi.string().valid('close', 'open').default('open')
});

function validateRestaurant(data) {
    return restaurantJoiSchema.validate(data);
}

RestaurantSchema.index({ name: 1 });

module.exports = {
    Restaurant: mongoose.model('Restaurant', RestaurantSchema),
    validateRestaurant
};
