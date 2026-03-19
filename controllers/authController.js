const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { getIO } = require("../sockets/socket");
const sendEmail = require("../utils/sendEmail");
const getVerificationEmailTemplate = require("../utils/verifyEmailTemplate");
const getResetPasswordEmailTemplate = require("../utils/resetPasswordEmailTemplate");
const jwt = require("jsonwebtoken");

//register
const registerController = async (req, res) => {
  try {
    const { firstName, lastName, email, password, mobile } = req.body || {};

    if (!firstName || !lastName || !email || !password || !mobile) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required fields!",
      });
    }
    //check user exists
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.status(400).send({
        success: false,
        message: "User already exists!",
      });
    }
    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // create user
    const user = await userModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      mobile,
      verificationToken,
      verificationTokenExpires: Date.now() + 5 * 60 * 1000, // 5 min
    });
    ////////////////////////////////  SEND EMAIL PART START  /////////////////////////////////////////////

    const verifyUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your email",
      html: getVerificationEmailTemplate(verifyUrl, user.firstName),
    });
    ////////////////////////////////  SEND EMAIL PART END  /////////////////////////////////////////////

    ////////////////////////////////  SOCKET PART START  //////////////////////////////////////////////////

    //real-time admin notification ke liye
    const io = getIO();

    io.to("admin").emit("newUserRegistered", {
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      createdAt: user.createdAt,
    });
    ////////////////////////////////  SOCKET PART END  ///////////////////////////////////////////////////
    //response
    res.status(201).send({
      success: true,
      message: "user registered successfully. Please verify your email.",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Error in Register API",
    });
  }
};
//verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await userModel.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send({
        message: "Invalid or expired token",
      });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    res.status(200).send({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Verify Email API",
      error,
    });
  }
};
// login
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400).send({
        success: false,
        message: "Please provide required fields!",
      });
    }

    // user check
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Invalid credentials",
      });
    }
    //check verified
    if (!user.isVerified) {
      return res.status(400).send({
        success: false,
        message: "Please verify your email first",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send({
        success: false,
        message: "Invalid credentials",
      });
    }
    //generate jwt
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.status(200).send({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.firstName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login API",
    });
  }
};
// forget-password
const forgetPasswordController = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Please provide email",
      });
    }
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    // generate token
    const resetToken = crypto.randomBytes(20).toString("hex");
    // hash token
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    const resetUrl = `http://localhost:5000/api/auth/reset-password?token=${resetToken}`;
    ////////////////////////////////  SEND EMAIL PART START  //////////////////////////////////////////////////
    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      html: getResetPasswordEmailTemplate(resetUrl, user.firstName),
    });
    ////////////////////////////////  SEND EMAIL PART END  //////////////////////////////////////////////////
    res.status(200).send({
      success: true,
      message: "Reset link sent to email",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: true,
      message: "Error in Forget Password API",
    });
  }
};
// reset-password
const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send({
        success: false,
        message: "Token missing",
      });
    }
    //hash token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    //user find kro
    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).send({
        success: false,
        massage: "Invalid and expired token",
      });
    }
    const { password } = req.body || {};
    if (!password) {
      return res.status(400).send({
        success: false,
        message: "Please provide new password",
      });
    }
    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    //password update
    user.password = hashedPassword;

    //cleanup
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).send({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Reset Password API",
    });
  }
};
// logout
const logoutUserController = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { logoutUserController };

module.exports = {
  registerController,
  verifyEmail,
  loginController,
  forgetPasswordController,
  resetPasswordController,
  logoutUserController
};
