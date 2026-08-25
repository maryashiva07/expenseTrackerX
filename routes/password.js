const express = require("express");
const router =  express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const brevo = require("../config/brevo");

const User = require("../modules/User");



router.post("/forgotpassword", async(req, res)=>{
      try{
            const {email} = req.body;

            if(!email){
                 return res.status(400).json({
                     message: "Emain is required!",
                 });
            };


            //find User
            const user = await User.findOne({
                 where:{
                    email: email,
                 }
            });

            if(!user){
                 return res.status(404).json({
                     message: "User not found!",
                 });
            }

            const resetToken = jwt.sign(
                {
                     id: user.id,
                     email: user.email,
                     purpose: "password-reset",
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "15m",
                }
            );

            //Save token in User table
            await user.update({
                resetToken: resetToken,
                resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
            });

            //Create reset link
            const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

            //Send email using Brevo
            await brevo.transactionalEmails.sendTransacEmail({
                  sender:{
                    name: process.env.BREVO_SENDER_NAME,
                    email: process.env.BREVO_SENDER_EMAIL,
                  },

                  to: [
                    {
                        email: user.email,
                        name: user.name,
                    },
                  ],

                  subject: "Reset Your Password",
                  htmlContent: `<h2>Password Reset</h2>
                          <p>Hello ${user.name},</p>
                          <p>We received a request to reset your password.</p>
                          <p>Click Button Below!</p>

                          <a href="${resetLink}">Reset Password!</a>

                          <P>This link will expire in 15 minutes.</P>
                  `
            });

            return res.status(200).json({
                  message: "Password reset link sent to your email",
            });
      }
      catch(err){
          console.error("Forgot password error:", err);

          return res.status(500).json({
              message: "Something went wrong", 
              err: err.message
          })
      }
});



router.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                message: "New password is required!",
            });
        }

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Make sure this token is specifically for password reset
        if (decoded.purpose !== "password-reset") {
            return res.status(400).json({
                message: "Invalid reset token!",
            });
        }

        // Find user
        const user = await User.findOne({
            where: {
                id: decoded.id,
                resetToken: token,
            },
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or already used reset token!",
            });
        }

        // Check database expiry
        if (
            !user.resetTokenExpiry ||
            new Date() > new Date(user.resetTokenExpiry)
        ) {
            return res.status(400).json({
                message: "Reset token has expired!",
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await user.update({
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        });

        return res.status(200).json({
            message: "Password reset successfully!",
        });

    } catch (err) {
        console.error("Reset password error:", err);

        if (err.name === "TokenExpiredError") {
            return res.status(400).json({
                message: "Reset token has expired!",
            });
        }

        if (err.name === "JsonWebTokenError") {
            return res.status(400).json({
                message: "Invalid reset token!",
            });
        }

        return res.status(500).json({
            
            message: "Something went wrong",
        });
    }
});


module.exports = router;