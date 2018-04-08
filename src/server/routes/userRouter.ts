/* Routes for  user account related
requests, like login and register */

import express = require("express");

import {config} from "../../config";
import {checks, StringValidator} from "../../shared/StringValidator";
import {asyncMiddleware} from "../utils/asyncMiddleware";
import * as crypt from "../utils/crypt";
import * as fileHandler from "../utils/fileHandler";
import {ERRORS, JSONResponse} from "../utils/JSONResponse";

export const router = express.Router();

async function getUserData() {
    return JSON.parse(await fileHandler.readFile(
        config.database.users));
}

function isRegistered(userData: any) {
    return userData.password !== undefined;
}

router.use((req, res, next) => {
    if (req.session.user) {
        res.redirect("/");
    } else {
        next();
    }
});

router.get("/login", asyncMiddleware(async (_1, res) => {
    const userData = await getUserData();
    if (!isRegistered(userData)) {
        return res.redirect("/users/register");
    }

    res.render("login.html");
}));

router.post("/login", asyncMiddleware(async (req, res) => {
    const userData = await getUserData();
    if (!isRegistered(userData)) {
        return JSONResponse.Error(res, ERRORS.UserErrors.NotRegistered);
    }
    const password: string = req.body.password;
    if (password === undefined) {
        return JSONResponse.Error(res, ERRORS.UserErrors.LoginIncorrect);
    }

    if (await crypt.verifyPassword(password, userData.password)) {
        req.session.user = crypt.decrypt(userData.key, password);
        return JSONResponse.ResourceCreated(res, {
            type: "session",
            id: req.session.id
        });
    } else {
        return JSONResponse.Error(res, ERRORS.UserErrors.LoginIncorrect);
    }
}));

router.get("/register", asyncMiddleware(async (_1, res) => {
    const userData = await getUserData();
    if (isRegistered(userData)) {
        return res.redirect("/users/login");
    }
    res.render("register.html");
}));

router.post("/register", asyncMiddleware(async (req, res, _NEXT) => {
    const userData = await getUserData();
    if (isRegistered(userData)) {
        return JSONResponse.Error(res, ERRORS.UserErrors.IsRegistered);
    }
    const password: string = req.body.password;
    const passwordCheck: StringValidator = new StringValidator(
        req.body.password, checks.password);
    if (!passwordCheck.valid) {
        return JSONResponse.Error(res, ERRORS.UserErrors.InvalidPassword);
    } else {
        const encryptKey: string = crypt.encrypt(await crypt.genEncryptKey(),
                                         password);
        const passwordHash: string = await crypt.hashPassword(password);

        userData.key = encryptKey;
        userData.password = passwordHash;
        await fileHandler.writeFile(config.database.users,
                    JSON.stringify(userData));
        return JSONResponse.ResourceCreated(res);
    }
}));
