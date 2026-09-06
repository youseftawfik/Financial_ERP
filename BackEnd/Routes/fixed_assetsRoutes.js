const express = require("express")

const router = express.Router();

const authenticate = require("../Middlewares/authenticate");
const authorize = require("../Middlewares/authorize");

const { addasset, getallassets, getassetById, updateAsset } = require("../Controllers/fixed_assetsController")

router.post("/add", authenticate, authorize("Accountant"), addasset);
router.get("/", authenticate, authorize("Accountant"), getallassets);
router.get("/:id", authenticate, authorize("Accountant"), getassetById);
router.put("/:id", authenticate, authorize("Accountant"), updateAsset);
// router.get("/:id/aging", authenticate, authorize("Accountant"), getVendorAgingSummary);
// router.patch("/status/:id", authenticate, authorize("Accounting Manager"), updatestatus);

// router.get("/:status", authenticate, authorize("Accountant"), getJAPByStatus);

// router.post("/train", authenticate, authorize("Accountant"),trainAI);

module.exports = router;