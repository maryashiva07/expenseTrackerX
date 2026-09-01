const Expense = require("../modules/Expense");
const { redisClient } = require("../config/redis");
const { googleGenAi } = require("../controllers/genaiController");
const ExpenseHistory = require("../modules/ExpenseHistory");
const sequelize = require("../config/database");



// Get AI category from Redis or Gemini

const getCategoryFromCacheOrAI = async (
  description,
  fallbackCategory = "Other",
) => {
  try {
    const normalizedDescription = description
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    const categoryCacheKey = `category:${normalizedDescription}`;

    const cachedCategory = await redisClient.get(categoryCacheKey);

    if (cachedCategory) {
      console.log("AI category fetched from Redis cache");

      return cachedCategory;
    }

    console.log("Calling Gemini AI for category");

    const category = await googleGenAi(description);

    await redisClient.set(categoryCacheKey, category, {
      EX: 60 * 60 * 24,
    });

    console.log("AI category saved in Redis cache");

    return category;
  } catch (error) {
    console.error(
      "AI categorization failed. Using fallback category:",
      error.message,
    );

    return fallbackCategory;
  }
};



// Create expense

const createExpenses = async (req, res) => {
  const { amount, description, note } = req.body;

  let transaction;

  try {
    transaction = await sequelize.transaction();

    const category = await getCategoryFromCacheOrAI(description, "Other");

    console.log("Generated category:", category);

    const expense = await Expense.create(
      {
        amount,
        description,
        category,
        note,
        userId: req.user.id,
      },
      {
        transaction,
      },
    );

    const expenseHistory = await ExpenseHistory.create(
      {
        amount,
        description,
        category,
        note,
        userId: req.user.id,
      },
      {
        transaction,
      },
    );

    await transaction.commit();

    const cacheKey = `expenses:user:${req.user.id}`;

    await redisClient.del(cacheKey);

    console.log("Expense list Redis cache deleted");

    res.status(201).json({
      message: "Expense created Successfully",

      expenses: {
        id: expense.id,
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        note: expense.note,
      },

      expenseHistory,
    });
  } catch (err) {
    console.error("Create Expense Error:", err);

    if (transaction) {
      await transaction.rollback();
    }

    res.status(500).json({
      message: "Error on expense creation",

      err: err.message,
    });
  }
};



// Get history data

const getHistoryData = async (req, res) => {
  const userId = req.user.id;

  try {
    const historyData = await ExpenseHistory.findAll({
      where: {
        userId: userId,
      },

      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Expense Fetched Successfully",

      historyData,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error on fetching expenses",

      err: err.message,
    });
  }
};



// Show all expenses

const showExpenses = async (req, res) => {
  try {
    const userId = req.user.id;

    const cacheKey = `expenses:user:${userId}`;

    const cachedExpense = await redisClient.get(cacheKey);

    if (cachedExpense) {
      console.log("Redis expense cache hit");

      return res.status(200).json({
        message: "Expenses fetched from cache",

        expenses: JSON.parse(cachedExpense),
      });
    }

    console.log("Expenses fetched from SQL");

    const expenses = await Expense.findAll({
      where: {
        userId: userId,
      },

      order: [["createdAt", "DESC"]],
    });

    await redisClient.set(cacheKey, JSON.stringify(expenses), {
      EX: 60 * 5,
    });

    res.status(200).json({
      message: "Expenses Fetched Successfully",

      expenses,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error on fetching Expenses",

      err: err.message,
    });
  }
};



// Delete expense

const deleteExpenses = async (req, res) => {
  const { id } = req.params;

  try {
    const expense = await Expense.findOne({
      where: {
        id: id,

        userId: req.user.id,
      },
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    await expense.destroy();

    const cacheKey = `expenses:user:${req.user.id}`;

    await redisClient.del(cacheKey);

    console.log("Redis expense cache deleted:", cacheKey);

    res.status(200).json({
      message: "Expense Deleted successfully",
    });
  } catch (err) {
    console.error("Delete Expense Error:", err);

    res.status(500).json({
      message: "Error deleting expenses",

      err: err.message,
    });
  }
};



// Edit expense

const editExpenses = async (req, res) => {
  const { id } = req.params;

  const { amount, description, note } = req.body;

  try {
    const expense = await Expense.findOne({
      where: {
        id: id,

        userId: req.user.id,
      },
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found!",
      });
    }

    if (amount !== undefined && amount !== "") {
      expense.amount = amount;
    }

    const oldDescription = expense.description;

    if (description !== undefined && description.trim() !== "") {
      expense.description = description;

      // categorize if description changed

      if (
        description.trim().toLowerCase() !== oldDescription.trim().toLowerCase()
      ) {
        const category = await getCategoryFromCacheOrAI(
          description,
          expense.category,
        );

        expense.category = category;
      }
    }

    if (note !== undefined) {
      expense.note = note;
    }

    await expense.save();

    const cacheKey = `expenses:user:${req.user.id}`;

    await redisClient.del(cacheKey);

    console.log("Redis expense cache deleted after update");

    res.status(200).json({
      message: "Expense Updated successfully",

      expense,
    });
  } catch (err) {
    console.error("Edit Expense Error:", err);

    res.status(500).json({
      message: "Error on updation",

      err: err.message,
    });
  }
};



module.exports = {
  createExpenses,
  getHistoryData,
  showExpenses,
  deleteExpenses,
  editExpenses,
};
