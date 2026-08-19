const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const sequelize = require("./config/database");
const signRouter = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api", signRouter);

const PORT = process.env.PORT || 4555;

async function startServer(){
   try{
           await sequelize.authenticate();
           console.log("database connected successfully!");
          await sequelize.sync();
          console.log("table has sync!");

          app.listen(PORT, ()=>{
             console.log("Server is running on Port : ", PORT);
            })
       }
       catch(err){
          console.log("error on connecting server", err);
       }

};

startServer();