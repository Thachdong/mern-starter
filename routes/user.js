const router = require("express-promise-router")();
const userControllers = require("../controllers/user");
const passport = require("passport");

router.post("/register", userControllers.register);
router.post("/login", passport.authenticate("local", {session: false}), userControllers.login);
router.patch("/update", passport.authenticate("jwt", {session: false}), userControllers.update);
router.post("/logout", passport.authenticate("jwt", {session: false}), userControllers.logout);
router.post("/reset-password", userControllers.resetPassword);

module.exports = router;
