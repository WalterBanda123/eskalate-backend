require('../restaurant');
const mongoose = require('mongoose');
const Joi = require('joi');

const MealSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    foodName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    imageUrl: {
        type: String,
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    }
});

const mealJoiSchema = Joi.object({
    foodName: Joi.string().required(),
    rating: Joi.number().min(0).max(5).required(),
    imageUrl: Joi.string().required(),
    restaurant: Joi.string().required()
});

function validateMeal(data) {
    return mealJoiSchema.validate(data);
}

module.exports = {
    Meal: mongoose.model('Meal', MealSchema),
    validateMeal
};
