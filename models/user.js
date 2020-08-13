const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: "Username is require"
  },
  email: {
    type: String,
    required: "Email is required"
  },
  password: {
    type: String,
    required: "Password is required"
  },
  isVerify: {
    type: Boolean,
    default: false,
  },
  loginAt: {
    type: Number,
    default: 0
  }
})

//Hashing password before saving
UserSchema.pre("save", async function(next) {
  //isModified method only return true if user init and return false if not 
  if (!this.isModified("password")) {
    return next();
  }
  //Hashing password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  return next()
})
//Methods
UserSchema.methods = {
  comparePassword: async function(plainPassword) {
    return await bcrypt.compare(plainPassword, this.password)
  }
}

module.exports = mongoose.model("User", UserSchema);