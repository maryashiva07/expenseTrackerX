const express = require("express");
const router = express.Router();

const {createUser} = require("../controllers/userController");


//post req

router.post("/signup", createUser);


module.exports = router;