/**
 * Implements reponses compliant with JSON API.
 * @module server/utils/JSONResponse
 */
import shortid = require("shortid");

import { Response } from "express";

/**
 * Toplevel attributes of a JSONAPI response.
 * Note: One of data, errors or meta is required.
 */
interface JSONAPIResponse {
    data?: any;
    errors?: any;
    meta?: any;
    jsonapi?: any;
    links?: any;
    included?: any;
}

/**
 * Represents a JSON Api Data resource
 */
interface Data {
    id?: string;
    type: string;
}

/**
 * Represents a JSON API error
 */
interface Error {
    id?: string;
    code: string;
    status: number;
    title: string;
    detail?: string;
}

/**
 * Represents a JSON API compliant response from a server.
 * @class
 */
export class JSONResponse {
    /**
     * Reponse when a resource has been created on the server in reponse
     * to a user request.
     * @param {Express.Response} res express response object for this request
     * @param {object} [data] An object related to the resource created.
     * @returns {JSONAPIResponse}
     */
    public static ResourceCreated(res: Response, data?: Data): JSONAPIResponse {
        if (data === undefined) {
            res.status(204);
            res.end();
        } else {
            res.status(201);
            res.json({data});
        }
        return {data};
    }

    /**
     * Reponse when an error occured due to a user request on the server,
     * @param  {Express.Response} res express response object for this request
     * @param  {JSONResponse.Error} err describes the error that occured.
     * Usually, this is a predefined error from `JSONResponse.ERRORS`. For
     * example, `ERRORS.UserErrors.InvalidPassword`
     * @returns {JSONAPIResponse}
     */
    public static Error(res: Response, err: Error): JSONAPIResponse {
        err.id = shortid.generate();
        res.status(err.status);
        res.json({errors: [err]});
        return {errors: err};
    }
}

/**
 * Represents the list of predefined errors in the program.
 */
interface PresetErrors {
    [errorType: string]: {[errorName: string]: Error};
}

/**
 * Predefined error response objects for the server. These are
 * subdivided into objects that represent the type of error.
 * For example, errors related to user register/login are stored in
 * `ERRORS.UserErrors`
 */
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
