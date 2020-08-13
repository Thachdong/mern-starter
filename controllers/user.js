const User = require("../models/user");
const {signToken, nodeMailerSending} = require("../helpers");

const register = async (req, res) => {
  const {userName, email, password} = req.body;
  //1. Check email is exist?
  const user = await User.findOne({email});
  if (user) {
    return res.status(400).json({
      success: true,
      message: "Email is already taken",
      data: null
    })
  }
  //2. Create new instance from User
  const newUser = new User({userName, email, password});
  await newUser.save();
  //3. Sign token
  const payload = {
    _id: newUser._id,
    fromEmail: true,
    loginAt: newUser.loginAt
  }
  const token = await signToken(payload);
  //4. Sending an email
  const origin = req.get("host");
  const url = `https://${origin}/${token}`;
  const mailOpts = {
    from: process.env.NODE_MAILER_USER,
    to: newUser.email,
    subject: "Activation account email",
    html: `
      <div>
        <h2>Activation account email</h2>
        <p>Click the following link to activate account</p>
        <a href=${url}>${url}</a>
      </div>
    `
  }
  nodeMailerSending(mailOpts);
  return res.status(200).json({
    success: true,
    message: "User created, please check your email to activate account",
    data: {...newUser._doc, password: null}
  })
}

const login = async (req, res) => {
  //1. Get user from passport
  const {user} = req;
  //2. Sign token
  const payload = {
    _id: user._id, 
    loginAt: user.loginAt
  }
  const token = await signToken(payload);
  return res.status(200).json({
    success: true,
    message: "Loign success",
    data: {...user._doc, password: null, token}
  })
}

const update = async (req, res) => {
  //1. Get user from passport-jwt
  const user = req.user;
  //2. Get update info
  const updateInfo = req.body;
  const updateUser = await User.findByIdAndUpdate(user._id, {...updateInfo}, {new: true});
  return res.status(203).json({
    success: true,
    message: "User updated",
    data: {...updateUser._doc, password: null}
  })
}

const logout = async (req, res) => {
  //1. Get user from passport-jwt
  const user = req.user;
  //2. Update loginAt flag
  await User.findByIdAndUpdate(user._id, {loginAt: new Date().getTime()});
  return res.status(200).json({
    success: true,
    message: "Logout success",
    data: null
  })
}

const resetPassword = async (req, res) => {
  //1. Get email from req
  const {email} = req.body;
  const user = await User.findOne({email});
  //2. Check email is exist?
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Unregister email",
      data: null
    })
  }
  //3. Sign token
  const payload = {
    _id: user._id,
    loginAt: user.loginAt,
    fromEmail: true
  }
  const token = await signToken(payload)
  //4. Sending an email
  const origin = req.get("host");
  const url = `https://${origin}/${token}`;
  const mailOpts = {
    from: process.env.NODE_MAILER_USER,
    to: user.email,
    subject: "Reset password email",
    html: `
      <div>
        <h2>Reset password email</h2>
        <p>Click the following link to reset password</p>
        <a href=${url}>${url}</a>
      </div>
    `
  }
  nodeMailerSending(mailOpts);
  return res.status(200).json({
    success: true,
    message: "Success, Please check your email",
    data: null
  })
}

module.exports = {
  register,
  login,
  update,
  logout,
  resetPassword
}