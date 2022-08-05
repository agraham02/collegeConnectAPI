const express = require("express");
const passport = require("passport");
const logInRouter = express.Router();
const authenticationController = require("../controllers/authenticationController");

logInRouter.get("/login", (req, res) => {
    res.json("Login Page");
});

// logInRouter.post("/login", passport.authenticate("local"), async (req, res) => {
//   const user = await req.user;
//   console.log(user);
//   res.json(user);
// });

logInRouter.post("/login", authenticationController.logIn);

logInRouter.post("/register", authenticationController.register);

logInRouter.post("/logout", (req, res, next) => {
    req.logOut((error) => {
        if (error) {
            return next(error);
        }
        res.redirect("/");
    });
});

module.exports = logInRouter;
