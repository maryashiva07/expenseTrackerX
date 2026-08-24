const {DataTypes} = require("sequelize");
const sequelize = require("../config/database");



const ExpenseHistory = sequelize.define("ExpenseHistory",{
       id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      amount:{
         type: DataTypes.FLOAT,
         allowNull: false
      },
      description:{
          type: DataTypes.STRING,
          allowNull: false
      },
      category:{
          type: DataTypes.STRING,
          allowNull: false
      },
      userId:{
         type: DataTypes.INTEGER,
         allowNull: false
      }

});


module.exports = ExpenseHistory;