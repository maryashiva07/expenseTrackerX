const {DataTypes} = require("sequelize");
const sequelize = require("../config/database");
require("dotenv").config();


const Order = sequelize.define("Order", {
      orderId:{
          type: DataTypes.STRING,
          primaryKey: true
      },
      userId:{
          type: DataTypes.INTEGER,
          allowNull: false
      },
      amount:{
          type: DataTypes.FLOAT,
          allowNull: false
      },
      status:{
          type: DataTypes.ENUM("PENDING", "SUCCESSFUL", "FAILED"),
          defaultValue: "PENDING"
      }
});


module.exports = Order;