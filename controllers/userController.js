const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../modules/User");

require("dotenv").config();

// SignUp routes
//Insert Users

const signupUser = async (req, res) =>{
      const {name, email, password} = req.body;

      try{

          //if User already exist
          const existingUser = await User.findOne({
              where:{
                  email: email
              }
          });

          if(existingUser){
             return res.status(409).json({
                 message: "User already Exist!"
             });
          };

          const hashedPassword = await bcrypt.hash(password,10);


            const user = await User.create({
                 name,
                 email,
                 password: hashedPassword
            });

            res.status(201).json({
                 message: "User created Successfully!",
                 user:{
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    isPremium: user.isPremium
                 }
            })
      }
      catch(err){
          res.status(500).json({
              message: "Error on User creation!",
              err: err.message
          });
      }
};




//login Controller

const loginUser = async (req, res) =>{
      const {email, password} = req.body;

      try{
            const user = await User.findOne({
                 where:{
                     email: email
                 }
            });

            if(!user){
                return res.status(401).json({
                    message: "Invalid Email or Password!"
                })
            };

            const isPassword = await bcrypt.compare(password, user.password);

            if(!isPassword){
                 return res.status(401).json({
                     message: "Invalid Email or Password!"
                 })
            };

            const token = await jwt.sign(
                {
                     id : user.id,
                     email: user.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

            res.status(201).json({
                 message: "Login Successfull",

                 token,

                 user: {
                     id: user.id,
                     name: user.name,
                     email: user.email,
                     isPremium: user.isPremium
                 }
            });
      }
      catch(err){
          res.status(500).json({
              message: "Error on Login",
              err: err.message
          })
      }
};


module.exports = {signupUser, loginUser};