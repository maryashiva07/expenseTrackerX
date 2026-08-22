const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const sequelize = require("./config/database");
const signRouter = require("./routes/userRoutes");
const loginRouter = require("./routes/userRoutes");
const expenseRouter = require("./routes/expenseRoutes");
const paymentRouter = require("./routes/paymentRoutes");
const {connectRedis} = require("./config/redis");


const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api", signRouter);
app.use("/api", loginRouter);
app.use("/api", expenseRouter);
app.use("/api/payment", paymentRouter);

const PORT = process.env.PORT || 4555;


//intial rendering
app.get("/", (req, res)=>{
     res.sendFile(path.join(__dirname, "public", "login.html"));
})

async function startServer(){
   try{
           await sequelize.authenticate();
           console.log("database connected successfully!");
          await sequelize.sync();
          console.log("table has sync!");

          await connectRedis();

          app.listen(PORT, ()=>{
             console.log("Server is running on Port : ", PORT);
            })
       }
       catch(err){
          console.log("error on connecting server", err);
       }

};

startServer();