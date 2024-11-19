const { registerValid } = require("../../validation/registerValid");
const User = require("../../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const registerUser = async (req, res) => {
  try {
    const saltRounds = 10;
    const { error } = registerValid.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }
    const { name, email, password, mobile_no } = req.body;
    const isEmailExist = await findUserByEmail(email);
    if (isEmailExist) {
      return res.status(400).json({
        message:
          "User Already Registered with this email. Try using Another Email",
      });
    }
    const isMobileExist = await User.findOne({ mobile_no: mobile_no });
    if (isMobileExist) {
      return res.status(400).json({
        message:
          "User Already Registered with this Mobile Number. Try using Another Number",
      });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const token = await createToken(email);
    await User.create({
      email: email,
      name: name,
      password: hashedPassword,
      mobile_no: mobile_no,
      token: token,
    });
    await sendVerificationLink(req, res, token);
    return res.status(201).json({
      message: "User created successfully",
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      error,
    });
  }
};

const getUser = async (req, res) => {
  try {
    if (!req.header.token) {
      return res.status(401).json({
        message: "you are not authorized to access the profile. Please Login",
      });
    }
    let userDetail;
    if (req.body.email) {
      userDetail = await findUserByEmail(req.body.email);
    } else if (req.body.id) {
      userDetail = await findUserById(req.body.id);
    } else {
      return res.status(400).json({
        message: "Please provide either email or id to retrieve the user.",
      });
    }
    if (!userDetail) {
      return res.status(400).json({
        message: "User Not Found",
      });
    }

    return res.status(200).json({
      message: "User Found",
      data: userDetail,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      error,
    });
  }
};

const signInUsingEmail = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "User Not Found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = createToken(email);
    await User.findByIdAndUpdate(user._id, { token });
    return res.status(200).json({
      message: "User logged in successfully",
      token: token,
    });
  } catch (error) {
    console.error("Error during sign-in:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const signInUsingMobile = async (req, res) => {
  const { mobile_no, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "User Not Found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = createToken(email);
    await User.findByIdAndUpdate(user._id, { token });
    return res.status(200).json({
      message: "User logged in successfully",
      token: token,
    });
  } catch (error) {
    console.error("Error during sign-in:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const signInUsingOtp = async (req, res) => {
  try {
    const isExist = findUserByMobile(req.body.mobile_no);
    if (!isExist) {
      return res.status(401).json({
        message: "No User Found Associated With this Mobile Number",
      });
    }
    // const otp =
  } catch (error) {}
};

async function findUserById(id) {
  try {
    const isExist = await User.findById(id);
    return isExist || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function findUserByEmail(email) {
  try {
    const isExist = await User.findOne({ email: email });
    return isExist || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function findUserByMobile(mobile) {
  try {
    const isExist = User.findOne({ mobile_no: mobile });
    return isExist || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function createToken(email) {
  const currentDateTime = new Date().toISOString();
  const payload = {
    email: email,
    date: currentDateTime,
  };
  const secretKey = "eiurhlnpocwinpow2897349cwnoiuefhsj";
  const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
  return token;
}

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "a88bfab5f7907a",
    pass: "d0d15d1888c5a3",
  },
});

const MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Moa Beat",
    link: "https://moabeat.netlify.app/auth/sign-in",
  },
});

const sendVerificationLink = async (req, res, token) => {
  console.log("sendMail", token);
  const { to, name, message } = req.body;
  const email = {
    body: {
      name: name,
      intro:
        message ||
        "Welcome to Moa Beat Community! We're very excited to have you on board.",
      outro: `<div style=" margin: auto; 
              width: 50%; 
              border: 4px solid gray; 
              padding: 10px;text-align: center; align-items:center; border-radius: 20px;"> 
                  <div style="margin:auto;width:50%; border: 6px solid brown; border-radius: 20px;"> 
                  <h3 style=" font-size: 15px; color: gray;">MoaBeat</h3> 
                  </div> 
                  <p>Thank You for registering with us!!</p> 
                  <h4 style="color:blue">Click on this link to verify and RESET your password</h4> 
                  <div style="margin:auto;width:20% ;border:2px solid; background:blue;"><a style="color:white;">Cick Here</a></div> 
              </div>`,
    },
  };
  const emailBody = MailGenerator.generate(email);
  const mailOptions = {
    from: process.env.EMAIL,
    to: "vejouhari@gmail.com",
    subject: "Test Email",
    html: emailBody,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent: " + info.response);
      res.send("Email sent successfully");
    }
  });
};

module.exports = {
  registerUser,
  getUser,
  signInUsingEmail,
  signInUsingMobile,
};
