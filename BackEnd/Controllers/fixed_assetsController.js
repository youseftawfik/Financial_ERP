const Fixed_Assets = require('../Models/Fixed_Assets');
const mongoose = require("mongoose")
const { assetsShema } = require("../Controllers/Validation/fixed_assetsValidation")

const addasset = async (req, res) => {
    try {
        const { error, value } = assetsShema.validate(req.body, { abortEarly: false, stripUnknown: true })

        const { name, acquisition_date, acquisition_cost, residual_value, status, useful_life_months,
                accumulated_depreciation, net_book_value, category, depreciation_method } = value

        if (error) return res.status(400).json({ msg: error.details.map(err => err.message) })

        const assets = await Fixed_Assets.findOne({ name })

        if (assets) return res.status(400).json({ msg: "Asset Already Exist" })

        const asset = await Fixed_Assets.create({ name, acquisition_date, acquisition_cost, residual_value, status, useful_life_months,
                accumulated_depreciation, net_book_value, category, depreciation_method })

        res.status(201).json({ msg: "Asset Created Successfully", data: asset })

    } catch (error) {
        res.status(500).json({ msg: "Server Error", error: error.message });
    }
}

const getallassets = async (req, res) => {
    try {

        const assets = await Fixed_Assets.find();

        res.status(200).json({ msg: "All Assets Retrived", assets })

    } catch (error) {
        res.status(500).json({ msg: "Server Error", error: error.message })
    }
}

const getassetById = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ msg: "ID is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: "Invalid ID" });
        }

        const data = await Fixed_Assets.findById(id);

        if (!data) {
            return res.status(404).json({ msg: "Asset not found" });
        }

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ msg: "Server Error", error: error.message });
    }
}

const updateAsset = async (req, res) => {
    try {

        const { error, value } = assetsShema.validate(req.body, { abortEarly: false, stripUnknown: true })

        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            return res.status(400).json({ msg: "ID is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: "Invalid Data" });
        }

        if (!Object.keys(updateData).length) {
            return res.status(400).json({ msg: "No data provided for update" });
        }

        const updatedItem = await Fixed_Assets.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedItem) {
            return res.status(404).json({ msg: "Asset not found" });
        }

        res.status(200).json({ msg: "Asset updated successfully", updatedItem });

    } catch (error) {
        res.status(500).json({ msg: "Server Error", error: error.message });
    }
};

module.exports = { addasset, getallassets, getassetById, updateAsset };