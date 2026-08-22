const express = require("express");
const router = express.Router();


const {createOrder, verifyPayment} = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");


//payment routes

router.post("/create-order", authMiddleware, createOrder);


// verify Routes

router.get("/verify/:orderId", authMiddleware, verifyPayment);


module.exports = router;