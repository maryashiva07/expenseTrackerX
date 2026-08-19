const User = require("../modules/User");


// SignUp routes
//Insert Users

const createUser = async (req, res) =>{
      const {name, email, password} = req.body;

      try{

          //if User already exist
          const existingUser = await User.findOne({
              where:{
                  email: email
              }
          });

          if(existingUser){
             return res.status(409).json("User already Exist!");
          };


            const user = await User.create({
                 name,
                 email,
                 password
            });

            res.status(201).json({
                 message: "User created Successfully!",
                 user
            })
      }
      catch(err){
          res.status(500).json({
              message: "Error on User creation!",
              err: err.message
          });
      }
};


module.exports = {createUser};