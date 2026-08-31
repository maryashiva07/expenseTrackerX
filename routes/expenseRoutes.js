const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {createExpenses, getHistoryData,  showExpenses, deleteExpenses, editExpenses} = require("../controllers/expenseController");


//post routes

router.post("/expenses", authMiddleware, createExpenses);

router.get("/history", authMiddleware, getHistoryData);

router.get("/expenses", authMiddleware, showExpenses);

router.delete("/expenses/:id", authMiddleware, deleteExpenses);

router.put("/expenses/:id", authMiddleware, editExpenses);

module.exports = router;
