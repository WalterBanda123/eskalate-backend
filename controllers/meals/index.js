const mongoose = require('mongoose');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const { Meal, validateMeal } = require('../../models/meal');
const { Restaurant, validateRestaurant } = require('../../models/restaurant');
const Joi = require('joi');

const getMeals = async (request, response) => {
    const schema = Joi.object({
        page: Joi.string().default('1'),
        limit: Joi.string().default('8'),
        search: Joi.string().optional().allow('').default(''),
    });

    try {
        const { page, limit, search } = await schema.validateAsync(request.query);

        const pipeline = [];

        if (search && search.trim() !== '') {
            const regex = new RegExp(search, 'i');
            pipeline.push({ $match: { foodName: regex } });
        }

        pipeline.push(
            {
                $lookup: {
                    from: 'restaurants',
                    localField: 'restaurant',
                    foreignField: '_id',
                    as: 'restaurant'
                }
            },
            { $unwind: '$restaurant' },
            {
                $project: {
                    foodName: 1,
                    rating: 1,
                    imageUrl: 1,
                    'restaurant.name': 1,
                    'restaurant.logo': 1,
                    'restaurant.status': 1
                }
            },
            { $limit: parseInt(limit) }
        );

        const meals = await Meal.aggregate(pipeline);
        response.status(StatusCodes.OK).json({
            message: ReasonPhrases.OK,
            data: meals,
            pagination: {
                total: await Meal.countDocuments(),
            },
        });
    } catch (error) {
        console.log(error)
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error', message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
}

const getMealById = async (request, response) => {
    const schema = Joi.object({
        id: Joi.string().length(24).hex().required(),
    });

    try {
        const { id } = await schema.validateAsync(request.params);

        // Check if the ID is valid MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return response.status(StatusCodes.BAD_REQUEST).json({
                error: 'Invalid ID format',
                message: 'The provided ID is not a valid MongoDB ObjectId'
            });
        }

        const meal = await Meal.findById(id).populate('restaurant');
        if (!meal) {
            return response.status(StatusCodes.NOT_FOUND).json({
                error: 'Meal not found',
                message: ReasonPhrases.NOT_FOUND
            });
        }

        response.status(StatusCodes.OK).json({
            message: ReasonPhrases.OK,
            data: meal,
        });
    } catch (error) {
        console.log(error);
        if (error.isJoi) {
            return response.status(StatusCodes.BAD_REQUEST).json({
                error: 'Validation Error',
                message: error.details[0].message
            });
        }
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Internal Server Error',
            message: ReasonPhrases.INTERNAL_SERVER_ERROR
        });
    }
}


const addMeal = async (request, response) => {
    try {
        const mealSchema = Joi.object({
            foodName: Joi.string().required(),
            rating: Joi.number().min(0).max(5).required(),
            imageUrl: Joi.string().required(),
            restaurant: Joi.object({
                name: Joi.string().required(),
                logo: Joi.string().required(),
                status: Joi.string().valid('close', 'open').default('open')
            }).required()
        });

        const { error } = mealSchema.validate(request.body);
        if (error) {
            return response.status(StatusCodes.BAD_REQUEST).json({
                error: 'Validation Error',
                message: error.details[0].message
            });
        }

        const { foodName, rating, imageUrl, restaurant: restaurantData } = request.body;

        // Create the restaurant first
        const restaurant = new Restaurant({
            _id: new mongoose.Types.ObjectId(),
            name: restaurantData.name,
            logo: restaurantData.logo,
            status: restaurantData.status || 'open'
        });

        await restaurant.save();

        // Create the meal with the restaurant ID
        const meal = new Meal({
            _id: new mongoose.Types.ObjectId(),
            foodName,
            rating,
            imageUrl,
            restaurant: restaurant._id
        });

        await meal.save();

        response.status(StatusCodes.CREATED).json({
            message: ReasonPhrases.CREATED,
            data: {
                meal,
                restaurant
            },
        });
    } catch (error) {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Internal Server Error',
            message: ReasonPhrases.INTERNAL_SERVER_ERROR
        });
    }
}

const updateMeal = async (request, response) => {
    const schema = Joi.object({
        id: Joi.string().length(24).hex().required(),
    });

    try {
        const { id } = await schema.validateAsync(request.params);

        // Check if the ID is valid MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return response.status(StatusCodes.BAD_REQUEST).json({
                error: 'Invalid ID format',
                message: 'The provided ID is not a valid MongoDB ObjectId'
            });
        }

        const updateFields = {};
        for (const key in request.body) {
            if (request.body[key] !== undefined) {
                updateFields[key] = request.body[key];
            }
        }
        const meal = await Meal.findByIdAndUpdate(id, updateFields, { new: true }).populate('restaurant');
        if (!meal) {
            return response.status(StatusCodes.NOT_FOUND).json({ error: 'Meal not found', message: ReasonPhrases.NOT_FOUND });
        }
        response.status(StatusCodes.OK).json({
            message: ReasonPhrases.OK,
            data: meal,
        });
    } catch (error) {
        if (error.isJoi) {
            return response.status(StatusCodes.BAD_REQUEST).json({
                error: 'Validation Error',
                message: error.details[0].message
            });
        }
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error', message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
}

const deleteMeal = async (request, response) => {
    const schema = Joi.object({
        id: Joi.string().length(24).hex().required(),
    });

    try {
        const { id } = await schema.validateAsync(request.params);

        // Check if the ID is valid MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return response.status(StatusCodes.BAD_REQUEST).json({
                error: 'Invalid ID format',
                message: 'The provided ID is not a valid MongoDB ObjectId'
            });
        }

        const meal = await Meal.findByIdAndDelete(id);
        if (!meal) {
            return response.status(StatusCodes.NOT_FOUND).json({ error: 'Meal not found', message: ReasonPhrases.NOT_FOUND });
        }
        response.status(StatusCodes.OK).json({
            message: ReasonPhrases.OK,
            data: meal,
        });
    } catch (error) {
        if (error.isJoi) {
            return response.status(StatusCodes.BAD_REQUEST).json({
                error: 'Validation Error',
                message: error.details[0].message
            });
        }
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error', message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
}

module.exports = {
    getMeals,
    getMealById,
    addMeal,
    updateMeal,
    deleteMeal,
};
