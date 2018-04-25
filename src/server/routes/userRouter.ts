/**
 * Routes for /users/*
 *
 * Handles user login and register.
 *
 * routes:
 *
 * GET /login: Display login form
 *
 * POST /login: Authenticate user password
 *
 * GET /register: Display register form
 *
 * POST /register: Register user password
 *
 * @module server/routes/userRouter
 */

import express = require("express");

import {config} from "../../config";
import {checks, StringValidator} from "../../shared/StringValidator";
import {asyncMiddleware} from "../utils/asyncMiddleware";
import * as crypt from "../utils/crypt";
import * as fileHandler from "../utils/fileHandler";
import {ERRORS, JSONResponse} from "../utils/JSONResponse";

export const router = express.Router();

/**
 * Check if user has registered a password in the app yet.
 * @param userData userData json from users.json
 * @returns {boolean}
 */
function isRegistered(userData: any) {
    return userData.password !== undefined;
}

/**
 * Express middleware to check whether the user is already logged in.
 * If yes, then redirect to root.
 * @name checkUserLoggedIn
 * @function
 */
router.use((req, res, next) => {
    if (req.session.user) {
        res.redirect("/");
    } else {
        next();
    }
});

/**
 * Route to serve login form
 * @name get/users/login
 * @function
 */
router.get("/login", asyncMiddleware(async (_1, res) => {
    const userData = await fileHandler.getUserData();
    if (!isRegistered(userData)) {
        return res.redirect("/users/register");
    }

    res.render("login.html");
}));

/**
 * Route to verify user password, and log in user if valid.
 * @name post/users/login
 * @function
 * @param {string} password the password as a POST param
 */
router.post("/login", asyncMiddleware(async (req, res) => {
    const userData = await fileHandler.getUserData();
    if (!isRegistered(userData)) {
        return JSONResponse.Error(res, ERRORS.UserErrors.NotRegistered);
    }
    const password: string = req.body.password;

    // Check if password field is provided
    if (password === undefined) {
        return JSONResponse.Error(res, ERRORS.UserErrors.LoginIncorrect);
    }

    // Verify password
    if (await crypt.verifyPassword(password, userData.password)) {
        // If password valid then set user session
        req.session.user = crypt.decryptMasterKey(
            Buffer.from(userData.key, "hex"), Buffer.from(password));
        return JSONResponse.ResourceCreated(res, {
            type: "session",
            id: req.session.id
        });
    } else {
        return JSONResponse.Error(res, ERRORS.UserErrors.LoginIncorrect);
    }
}));

/**
 * Route to server register form
 * @name get/users/register
 * @function
 */
router.get("/register", asyncMiddleware(async (_1, res) => {
    const userData = await fileHandler.getUserData();
    if (isRegistered(userData)) {
        return res.redirect("/users/login");
    }
    res.render("register.html");
}));

/**
 * Route to register user password, if valid.
 * @name post/users/register
 * @function
 * @param {string} password the password as a POST param
 */
router.post("/register", asyncMiddleware(async (req, res, _NEXT) => {
    const userData = await fileHandler.getUserData();
    if (isRegistered(userData)) {
        return JSONResponse.Error(res, ERRORS.UserErrors.IsRegistered);
    }
    const password: string = req.body.password;
    const passwordCheck: StringValidator = new StringValidator(
        req.body.password, checks.password);

    // Check if password follows format rules
    if (!passwordCheck.valid) {
        return JSONResponse.Error(res, ERRORS.UserErrors.InvalidPassword);
    } else {
        // If password valid, then generate a new user encryption key,
        // and store user password.
        const encryptKey: Buffer = await crypt.genEncryptKey();
        const passwordHash: string = await crypt.hashPassword(password);

        userData.key = (await crypt.encryptMasterKey(encryptKey,
                            Buffer.from(password))).toString("hex");
        userData.password = passwordHash;
        await fileHandler.writeFile(config.database.users,
                    JSON.stringify(userData));
        return JSONResponse.ResourceCreated(res);
    }
}));
