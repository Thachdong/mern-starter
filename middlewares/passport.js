const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const {ExtractJwt} = require("passport-jwt");
const User = require("../models/user");

passport.use(new LocalStrategy({
  usernameField: "email",
  passwordField: "password"
}, async (email, password, done) => {
  const user = await User.findOne({email});
  //1. Check user is exist?
  if (!user) {
    const error = new Error("Unregister email");
    return done(error, false);
  }
  //2. Compare password
  if (!user.comparePassword(password)) {
    const error = new Error("Wrong password");
    return done(error, false)
  }
  //3. Check is user verify?
  if (!user.isVerify) {
    const error = new Error("Unverify email, please check your email to activate account");
    return done(error, false)
  }
  //4. Update login flag
  user.loginAt = new Date().getTime();
  await user.save();
  return done(null, user)
}))

const jwtOpts = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

passport.use(new JwtStrategy(jwtOpts, async(payload, done) => {
  const user = await User.findById(payload._id);
  //1. Check user is exist?
  if (!user) {
    const error = new Error("User not found");
    return done(error, false)
  }
  //2. Check token is expire?
  if (user.loginAt !== payload.loginAt) {
    const error = new Error("Expire token");
    return done(error, false)
  }
  //3. Check user is verify (for activate user from email recieving url)
  if (payload.fromEmail) {
    return done(null, user)
  }
  //4. Everything is fine
  return done(null, user)
}))