const { Cashfree, CFEnvironment } = require("cashfree-pg");

const Order = require("../modules/Order");
const User = require("../modules/User");


// Cashfree Configuration

const cashfree = new Cashfree(
    CFEnvironment.SANDBOX,
    process.env.CASHFREE_CLIENT_ID,
    process.env.CASHFREE_CLIENT_SECRET
);


// Create Order

const createOrder = async (req, res) => {

    try {

        const userId = req.user.id;
        const { phone } = req.body;


        if (!phone) {

            return res.status(400).json({
                success: false,
                message: "Phone number required!"
            });

        }


        if (!/^[6-9]\d{9}$/.test(phone)) {

            return res.status(400).json({
                success: false,
                message: "Enter a valid 10 digit phone number"
            });

        }


        const user = await User.findByPk(userId);


        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        // Already Premium

        if (user.isPremium) {

            return res.status(400).json({
                success: false,
                message: "User is already a premium member"
            });

        }


        const orderId = "ORDER_" + Date.now();

        const amount = 499;


        // Save order

        await Order.create({

            orderId,
            userId,
            amount,
            status: "PENDING"

        });


        // Cashfree request

        const request = {

            order_id: orderId,

            order_amount: amount,

            order_currency: "INR",

            customer_details: {

                customer_id: String(user.id),

                customer_name: user.name,

                customer_email: user.email,

                customer_phone: phone

            },

            order_meta: {

                return_url:
                    `${process.env.FRONTEND_URL}/expense.html?order_id={order_id}`

            }

        };


        console.log("Creating Cashfree Order:", orderId);


        const response =
            await cashfree.PGCreateOrder(request);


        console.log(
            "Cashfree Order Created:",
            response.data
        );


        return res.status(200).json({

            success: true,

            orderId,

            paymentSessionId:
                response.data.payment_session_id

        });


    } catch (error) {

        console.log(
            "Cashfree Create Order Error:",
            error.response?.data || error.message
        );


        return res.status(500).json({

            success: false,

            message: "Unable to create payment order",

            error:
                error.response?.data ||
                error.message

        });

    }

};


// Verify Payment

const verifyPayment = async (req, res) => {

    try {

        const { orderId } = req.params;


        console.log(
            "Verifying Payment:",
            orderId
        );


        // Find order

        const order = await Order.findOne({

            where: {
                orderId
            }

        });


        if (!order) {

            return res.status(404).json({

                success: false,

                message: "Order not found in database"

            });

        }


        // Fetch payment from Cashfree

        const response =
            await cashfree.PGOrderFetchPayments(orderId);


        const payments = response.data;


        console.log(
            "Cashfree Payment Response:",
            payments
        );


        // No payment found

        if (
            !payments ||
            payments.length === 0
        ) {

            order.status = "FAILED";

            await order.save();


            return res.status(200).json({

                success: false,

                status: "FAILED",

                message: "TRANSACTION FAILED."

            });

        }


        const payment = payments[0];


        console.log(
            "Payment Status:",
            payment.payment_status
        );


        // Successful payment

        if (
            payment.payment_status === "SUCCESS"
        ) {

            // Update order

            order.status = "SUCCESSFUL";

            await order.save();


            // Make user premium

            const user =
                await User.findByPk(order.userId);


            if (user) {

                user.isPremium = true;

                await user.save();

            }


            console.log(
                "Payment Successful - User is Premium"
            );


            return res.status(200).json({

                success: true,

                status: "SUCCESSFUL",

                message: "Transaction successful"

            });

        }


        // Failed payment

        order.status = "FAILED";

        await order.save();


        return res.status(200).json({

            success: false,

            status: "FAILED",

            message: "TRANSACTION FAILED."

        });


    } catch (error) {

        console.log(
            "Payment Verification Error:",
            error.response?.data ||
            error.message
        );


        return res.status(500).json({

            success: false,

            message: "Payment verification failed",

            error:
                error.response?.data ||
                error.message

        });

    }

};


module.exports = {
    createOrder,
    verifyPayment
};