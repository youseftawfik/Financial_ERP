const mongoose = require("mongoose");

const glSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"],
        required: true,
    },
    subtype: {
        type: String,
        enum: ["current_asset", "long_term_liability"],
        required: true,
    },
    is_control: {
        type: Boolean,
        default: true
    },
    normal_balance: {
        type: String,
        enum: ["DEBIT" , "CREDIT"],
        required: true,
    }
}, {timestamps: true});

const GlAccount = mongoose.model("GlAccount", glSchema);

module.exports = GlAccount;