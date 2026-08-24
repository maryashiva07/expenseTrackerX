const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {createExpenses, getHistoryData,  showExpenses, deleteExpenses} = require("../controllers/expenseController");


//post routes

router.post("/expenses", authMiddleware, createExpenses);

router.get("/history", authMiddleware, getHistoryData);

router.get("/expenses", authMiddleware, showExpenses);

router.delete("/expenses/:id", authMiddleware, deleteExpenses);

module.exports = router;