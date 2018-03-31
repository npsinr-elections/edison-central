/* Routes for  user account related
requests, like login and register */

import express = require("express");
import {checks, StringValidator} from "../../shared/StringValidator";
export const router = express.Router();

router.get("/login", (req, res) => {
    // Serve login webpage
    const redirect: boolean =  (req.query.redirect === "true");
    let err = (req.query.err === "true") ;
    let message = "";

    if (redirect) { // User has been redirected from a protected page.
        err = true;
        message = "You have to login";
    } else {
        if (err) { // User failed a login attempt.
            message = "Username/Password was incorrect.";
        }
    }

    res.render("login.html", {err, message});
});

router.post("/login", (_1, _2) => {
 /* Check if user in database and password valid,
  and then set user session variable.*/
});

router.get("/register", (req, res) => {
    // Serve register webpage
    const err = (req.query.err === "true");
    let message = "";
    if (err) { // Form validation failed!
        message = "Invalid Username/Password";
    }
    res.render("register.html", {err, message});
});

router.post("/register", (req, res) => {
    // Register user in database if fields valid
    const username: StringValidator = new StringValidator(
        req.body.username, checks.username);

    const password: StringValidator = new StringValidator(
        req.body.password, checks.password);

    if (!username.valid || !password.valid) {
        res.json({message: "Username/Password is invalid",
                 status: "error"});
        return;
    }

    res.redirect("/login"); // User has registered, redirect.
});
