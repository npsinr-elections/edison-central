import shortid = require("shortid");

import { Response } from "express";

interface Data {
    id?: string;
    type: string;
}

interface Error {
    id?: string;
    code: string;
    status: number;
    title: string;
    detail?: string;
}
export class JSONResponse {
    public static ResourceCreated(res: Response, data?: Data) {
        if (data === undefined) {
            res.status(204);
            res.end();
        } else {
            res.status(201);
            res.json({data});
        }
        return {data};
    }
    public static Error(res: Response, err: Error) {
        err.id = shortid.generate();
        res.status(err.status);
        res.json({errors: [err]});
        return err;
    }
}

interface PresetErrors {
    [errorType: string]: {[errorName: string]: Error};
}

export const ERRORS: PresetErrors = {
    UserErrors: {
        /** Password didn't follow format rules */
        InvalidPassword: {
            code: "UserErrors.InvalidPasssword",
            status: 400,
            title: "Password didn't follow format rules",
            detail: "Password must have 5-12 characters, "
            + "with atleast one uppercase, lowercase and numeric character"
        },
        /** Incorrect Password */
        LoginIncorrect: {
            code: "UserErrors.LoginIncorrect",
            status: 403,
            title: "Incorrect Password",
            detail: "Password did not match with user registered password"
        },
        /** User already registered */
        IsRegistered: {
            code: "UserErrors.IsRegistered",
            status: 400,
            title: "User already registered",
            detail: "A user password as already been set. Login at /login"
        },
        /** User not registered */
        NotRegistered: {
            code: "UserErrors.NotRegistered",
            status: 400,
            title: "User not registered",
            detail: "No user password has been set. Register at /register"
        }
    }
};
