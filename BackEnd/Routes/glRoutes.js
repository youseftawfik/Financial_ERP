const express = require("express")

const router = express.Router();

const authenticate = require("../Middlewares/authenticate");
const authorize = require("../Middlewares/authorize");

const {addGlAccount, getallaccounts, updateAccount, deleteaccount} = require("../Controllers/glController")

router.post("/add", authenticate, authorize("Admin"), addGlAccount);
router.get("/accounts", authenticate, authorize("Admin"), getallaccounts);
router.put("/:id", authenticate, authorize("Admin"), updateAccount)
router.delete("/:id", authenticate, authorize("Admin"), deleteaccount);

module.exports = router;