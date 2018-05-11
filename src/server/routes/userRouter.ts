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
 */

import express = require("express");
import shortid = require("shortid");

import { checks, StringValidator } from "../../shared/StringValidator";
import { asyncMiddleware } from "../utils/asyncMiddleware";
import * as crypt from "../utils/crypt";
import * as database from "../utils/database";
import { ERRORS, JSONResponse } from "../utils/JSONResponse";

export const router = express.Router();

let userData: database.UserData;

/**
 * Check if user has registered a password in the app yet.
 * @returns
 */
function isRegistered(): boolean {
  return userData.password !== undefined;
}

/**
 * Express middleware to check whether the user is already logged in.
 * If yes, then redirect to root.
 * @name checkUserLoggedIn
 * @function
 */
router.use((req, res, next) => {
  // If user is logged in, ONLY allow logout request
  if (req.session.user && req.path !== "/logout") {
    res.redirect("/");
  } else {
    next();
  }
});

/**
 * Express middleware to read userData file and get its contents.
 * @name readUserData
 * @function
 */
router.use(asyncMiddleware(async (_1, _2, next) => {
  userData = await database.getUserData();
  next();
}));

/**
 * Route to serve login form
 * @name get/users/login
 * @function
 */
router.get("/login", (_1, res) => {
  if (!isRegistered()) {
    return res.redirect("/users/register");
  }

  res.render("login.html");
});

/**
 * Route to verify user password, and log in user if valid.
 * @name post/users/login
 * @function
 * @param password the password as a POST param
 */
router.post("/login", asyncMiddleware(async (req, res) => {
  if (!isRegistered()) {
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
    req.session.user = (await crypt.decryptMasterKey(
      Buffer.from(userData.key, "hex"),
      Buffer.from(password)))
      .toString("hex");
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
router.get("/register", async (_1, res) => {
  if (isRegistered()) {
    return res.redirect("/users/login");
  }
  res.render("register.html");
});

/**
 * Route to register user password, if valid.
 * @name post/users/register
 * @function
 * @param password the password as a POST param
 */
router.post("/register", asyncMiddleware(async (req, res, _NEXT) => {
  if (isRegistered()) {
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
    await database.writeUserData(userData);

    const newElectionData: database.Election = {
      id: shortid.generate(),
      name: "",
      description: "",
      image: "",
      color: "",
      offices: []
    };
    await database.writeElectionData(newElectionData, encryptKey);
    return JSONResponse.ResourceCreated(res);
  }
}));

router.get("/logout", (req, res, next) => {
  userData.key = undefined;
  userData.password = undefined;

  req.session.destroy((err) => {
    if (err) {
      next(err);
    }
    res.redirect("/users/login");
  });

});
