/**
 * Implements reponses compliant with JSON API.
 */
import shortid = require("shortid");

import { Response } from "express";

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
  public static Data(res: Response, data: any) {
    res.status(200);
    res.json(data);
    return data;
  }
  /**
   * Reponse when an error occured due to a user request on the server,
   * @param  {Express.Response} res express response object for this request
   * @param  {JSONResponse.Error} err describes the error that occured.
   * Usually, this is a predefined error from `JSONResponse.ERRORS`. For
   * example, `ERRORS.UserErrors.InvalidPassword`
   * @returns JSONAPIResponse
   */
  public static Error(res: Response, err: Error) {
    err.id = shortid.generate();
    res.status(err.status);
    res.json({ errors: [err] });
    return { errors: err };
  }
}

/**
 * Represents the list of predefined errors in the program.
 */
interface PresetErrors {
  UserErrors: {
    /** Password didn't follow format rules */
    InvalidPassword: Error;
    /** Incorrect Password */
    LoginIncorrect: Error;
    /** User already registered */
    IsRegistered: Error;
    /** User not registered */
    NotRegistered: Error
  };
  PageError: {
    /** Page not found */
    NotFound: Error
  };
  ResourceError: {
    /** Resource not found */
    NotFound: Error
  };
}

/**
 * Predefined error response objects for the server. These are
 * subdivided into objects that represent the type of error.
 * For example, errors related to user register/login are stored in
 * `ERRORS.UserErrors`
 */
export const ERRORS: PresetErrors = {
  UserErrors: {
    InvalidPassword: {
      code: "UserErrors.InvalidPasssword",
      status: 400,
      title: "Password didn't follow format rules",
      detail: "Password must have 5-12 characters, "
        + "with atleast one uppercase, lowercase and numeric character"
    },
    LoginIncorrect: {
      code: "UserErrors.LoginIncorrect",
      status: 403,
      title: "Incorrect Password",
      detail: "Password did not match with user registered password"
    },
    IsRegistered: {
      code: "UserErrors.IsRegistered",
      status: 400,
      title: "User already registered",
      detail: "A user password as already been set. Login at /login"
    },
    NotRegistered: {
      code: "UserErrors.NotRegistered",
      status: 400,
      title: "User not registered",
      detail: "No user password has been set. Register at /register"
    }
  },
  PageError: {
    NotFound: {
      code: "pageError.notFound",
      status: 404,
      title: "Page does not exist",
      detail: ""
    }
  },
  ResourceError: {
    NotFound: {
      code: "pageError.notFound",
      status: 404,
      title: "Resource does not exist",
      detail: ""
    }
  }
};
