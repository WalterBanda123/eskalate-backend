const mongoose = require('mongoose');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const Meal = require('../../models/meal').Meal;
const Joi = require('joi');

const getMeals = async (request, response) => {
    const schema = Joi.object({
        page: Joi.string().required(),
        limit: Joi.string().required(),
        search: Joi.string().optional(),
    });

    try {
        const { page, limit, search } = await schema.validateAsync(request.params);

        const pipeline = [];

        if (search) {
            const regex = new RegExp(search, 'i');
            pipeline.push({ $match: { name: regex } });
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
                    name: 1,
                    description: 1,
                    price: 1,
                    image: 1,
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
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error', message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
}


const addMeal = async (request, response) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().min(5).max(500).required(),
        price: Joi.number().min(0).required(),
        image: Joi.string().uri().required(),
    });

    try {
        const { name, description, price, image } = await schema.validateAsync(request.body);
        const meal = new Meal({ _id: new mongoose.Schema.Types.ObjectId(), name, description, price, image });
        await meal.save();
        response.status(StatusCodes.CREATED).json({
            message: ReasonPhrases.CREATED,
            data: meal,
        });
    } catch (error) {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error', message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
}

const updateMeal = async (request, response) => {
    const schema = Joi.object({
        id: Joi.string().required(),
    });

    try {
        const { id } = await schema.validateAsync(request.params);

        const updateFields = {};
        for (const key in request.body) {
            if (request.body[key] !== undefined) {
                updateFields[key] = request.body[key];
            }
        }
        const meal = await Meal.findByIdAndUpdate(id, updateFields, { new: true });
        if (!meal) {
            return response.status(StatusCodes.NOT_FOUND).json({ error: 'Meal not found', message: ReasonPhrases.NOT_FOUND });
        }
        response.status(StatusCodes.OK).json({
            message: ReasonPhrases.OK,
            data: meal,
        });
    } catch (error) {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error', message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
}

const deleteMeal = async (request, response) => {
    const schema = Joi.object({
        id: Joi.string().required(),
    });

    try {
        const { id } = await schema.validateAsync(request.params);

        const meal = await Meal.findByIdAndDelete(id);
        if (!meal) {
            return response.status(StatusCodes.NOT_FOUND).json({ error: 'Meal not found', message: ReasonPhrases.NOT_FOUND });
        }
        response.status(StatusCodes.OK).json({
            message: ReasonPhrases.OK,
            data: meal,
        });
    } catch (error) {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error', message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
}
