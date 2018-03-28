import express = require("express");

export const router = express.Router();

router.get("/login", (req, res) => {
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
