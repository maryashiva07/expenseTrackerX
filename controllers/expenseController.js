const Expense = require("../modules/Expense");

//create expense

const createExpenses = async (req, res) =>{
      const {amount, description, category} = req.body;

      try{
            const expenses = await Expense.create({
                  amount,
                  description,
                  category,

                  userId: req.user.id
            });

            res.status(201).json({
                 message: "Expense created Successfully",
                 expenses:{
                    id: expenses.id,
                    amount: expenses.amount,
                    description: expenses.description,
                    category: expenses.category
                 }
            });
      }
      catch(err){
          res.status(500).json({
             message: "Error on expense creation",
             err: err.message
          })
      }
};


//Show all expenses

const showExpenses = async (req, res) =>{
      try{
             const expenses = await Expense.findAll({
                  where:{
                     userId : req.user.id
                  },
                  order:[
                    ["createdAt","DESC"]
                  ]
             });

             res.status(200).json({
                 message: "Expenses Fetched Successfully",
                 expenses
             })
      }
      catch(err){
           res.status(500).json({
              message: "Error on fetching Expenses",
              err: err.message
           })
      }
};


// delete expenses

const deleteExpenses = async (req, res) =>{
      const {id} = req.params;
      try{
            const expense = await Expense.findOne({
                 where:{
                    id: id,
                    userId: req.user.id
                 }
            });

            if(!expense){
                return res.status(404).json({
                     message: "Expense not found"
                })
            }

            expense.destroy();

            res.status(200).json({
                 message: "Expense Deleted successfully"
            })
      }
      catch(err){
          res.status(500).json({
              message: "Error deleting expenses",
              err: err.message
          })
      }
};


module.exports = {
    createExpenses,
    showExpenses,
    deleteExpenses
};