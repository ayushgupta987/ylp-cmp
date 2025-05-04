const BaseJoi = require('joi');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.noHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        noHTML: {
            validate(value, helpers) {
                const htmlTagRegex = /<\/?[^>]*>/g;
                if (htmlTagRegex.test(value)) {
                    return helpers.error('string.noHTML', { value });
                }
                return value;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().noHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().required().noHTML(),
        description: Joi.string().required().noHTML()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().noHTML()
    }).required()
});
