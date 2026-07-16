const express = require("express")

const router = express.Router();

const authenticate = require("../Middlewares/authenticate");
const authorize = require("../Middlewares/authorize");

const {addAp_invoices, getallAp_invoices, getJAPById, getJAPByStatus, getVendorAgingSummary, updatestatus, getFullAPAgingReport} = require("../Controllers/ap_invoicesController")

router.get("/:status", authenticate, authorize("Accountant"), getJAPByStatus);
router.post("/add", authenticate, authorize("Accountant"), addAp_invoices);
router.get("/", authenticate, authorize("Accountant"), getallAp_invoices);
router.get("/all/:id", authenticate, authorize("Accountant"), getJAPById);
router.get("/:id/aging", authenticate, authorize("Accountant"), getVendorAgingSummary);
router.patch("/status/:id", authenticate, authorize("Accounting Manager"), updatestatus);

router.get("/ap/:id/aging", authenticate, authorize("Accountant"), getFullAPAgingReport);

module.exports = router;