const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");

const signToken = async(payload) => {
  return await jwt.sign(payload, process.env.JWT_SECRET)
}

const nodeMailerSending = (mailOpts) => {
  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODE_MAILER_USER,
      pass: process.env.NODE_MAILER_PASS
    }
  });
  transporter.sendMail(mailOpts, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email send: ${info.response}`);
    }
  })
}

module.exports = {
  signToken,
  nodeMailerSending
}