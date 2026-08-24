const Expense = require("../modules/Expense");
const { redisClient } = require("../config/redis");
const {googleGenAi} = require("../controllers/genaiController");
const ExpenseHistory = require("../modules/ExpenseHistory");
const sequelize = require("../config/database");


// Create expense

const createExpenses = async (req, res) => {

    const {
        amount,
        description
    } = req.body;

    let transaction;


    try {

        transaction = await sequelize.transaction();

        const category = await googleGenAi(description);

        console.log("Ai gen Category: ", category);

        const expense = await Expense.create({

            amount,
            description,
            category,

            userId: req.user.id,
           },
           {
               transaction
           }
        
        );

        const expenseHistory = await ExpenseHistory.create(
            {
                amount,
                description,
                category,
                userId: req.user.id
            },
            {
                transaction
            }
        );

        await transaction.commit();


        const cacheKey =
            `expenses:user:${req.user.id}`;


        await redisClient.del(cacheKey);


        res.status(201).json({

            message:
                "Expense created Successfully",

            expenses: {

                id: expense.id,

                amount: expense.amount,

                description:
                    expense.description,

                category:
                    expense.category

            },

            expenseHistory

        });

    }

    catch (err) {

        console.error("Create Expense Error: ", err);

        if(transaction){
             await transaction.rollback();
        }

        res.status(500).json({

            message:
                "Error on expense creation",

            err: err.message

        });

    }

};


//Get History Data

const getHistoryData = async (req, res) =>{
      const userId = req.user.id;

     try{
           const historyData = await ExpenseHistory.findAll({
                 where:{
                     userId: userId
                 },
                 order:[
                    ["createdAt", "DESC"]
                 ]
           });

           res.status(200).json({
              message: "Expense Fetched Successfully",
              historyData
           })
     }
     catch(err){
        res.status(500).json({
              message: "Error on fetching expenses",
              err: err.message
        })
     }
};


// Show all expenses

const showExpenses = async (req, res) => {

    try {

        const userId = req.user.id;

        const cacheKey =
            `expenses:user:${userId}`;


        const cachedExpense =
            await redisClient.get(cacheKey);


        if (cachedExpense) {

            console.log(
                "Redis cache hit"
            );


            return res.status(200).json({

                message:
                    "Expenses fetched from cache",

                expenses:
                    JSON.parse(cachedExpense)

            });

        }


        console.log(
            "Expenses fetched from SQL"
        );


        const expenses =
            await Expense.findAll({

                where: {

                    userId: userId

                },

                order: [
                    ["createdAt", "DESC"]
                ]

            });


        await redisClient.set(

            cacheKey,

            JSON.stringify(expenses),

            {
                EX: 60 * 5
            }

        );


        res.status(200).json({

            message:
                "Expenses Fetched Successfully",

            expenses

        });

    }

    catch (err) {

        res.status(500).json({

            message:
                "Error on fetching Expenses",

            err: err.message

        });

    }

};


// Delete expense

const deleteExpenses = async (req, res) => {

    const { id } = req.params;

    try {

        const expense =
            await Expense.findOne({

                where: {

                    id: id,

                    userId: req.user.id

                }

            });


        if (!expense) {

            return res.status(404).json({

                message:
                    "Expense not found"

            });

        }


        await expense.destroy();


        // Delete user's expense cache

        const cacheKey =
            `expenses:user:${req.user.id}`;


        await redisClient.del(cacheKey);


        console.log(
            "Redis cache deleted:",
            cacheKey
        );


        res.status(200).json({

            message:
                "Expense Deleted successfully"

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            message:
                "Error deleting expenses",

            err: err.message

        });

    }

};


module.exports = {
    createExpenses,
    getHistoryData,
    showExpenses,
    deleteExpenses
};