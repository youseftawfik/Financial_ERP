const Joi = require("joi");
const { model } = require("mongoose");

const assetsShema = Joi.object({
    name: Joi.string().required(),
    acquisition_date: Joi.string().required(),
    acquisition_cost: Joi.number().required(),
    residual_value: Joi.number().required(),
    useful_life_months: Joi.number().required(),
    accumulated_depreciation: Joi.number().required(),
    net_book_value: Joi.number().required(),
    status: Joi.string().valid("ACTIVE", "FULLY_DEPRECIATED", "DISPOSED").required(),
    category: Joi.string().valid("BUILDING", "EQUIPMENT", "VEHICLE", "IT", "FURNITURE").required(),
    depreciation_method: Joi.string().valid("STRAIGHT_LINE", "DECLINING_BALANCE").required(),
})

module.exports = { assetsShema };