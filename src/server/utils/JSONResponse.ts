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
  ReqErrors: {
    /** Parameter missing in request */
    paramError: (missingParams: string) => Error;
  };
  dataErrors: {
    /** ID not found */
    invalidID: (ID: string) => Error;
    /** Resource type for create/patch wrong */
    invalidResourceType: Error;
    /** Missing attribute in resource */
    missingAttribute: (resourceType: string,
                       missingAttr: string) => Error;
    /** Invalid attribute provided with resource */
    invalidAttribute: (resourceType: string,
                       invalidAttrs: string) => Error;
    /** Attribute Value didn't follow format */
    invalidValue: (invalidValue: string, invalidAttr: string) => Error;
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
  ReqErrors: {
    paramError: (missingParam: string) => {
      return {
        code: "ReqErrors.paramError",
        status: 400,
        title: "Missing parameters in request",
        detail: "parameter " + missingParam + "is REQUIRED"
      };
    }
  },
  dataErrors: {
    invalidID: (ID: string) => {
      return {
        code: "dataErrors.invalidOfficeID",
        status: 404,
        title: "Resource not found",
        detail: "There is no resource with the ID: " + ID
      };
    },
    invalidResourceType: {
      code: "dataErrors.invalidResourceType",
      status: 409,
      title: "Invalid Resource type field",
      detail: "The resource trying to be created/patched has wrong type"
    },
    missingAttribute: (resourceType: string, missingAttr: string) => {
      return {
        code: "dataErrors.missingAttribute",
        status: 409,
        title: "Missing attribute in resource",
        detail: "The attribute " + missingAttr + "was expected " +
          "in resource of type" + resourceType
      };
    },
    invalidAttribute: (resourceType: string, invalidAttr: string) => {
      return {
        code: "dataErrors.invalidAttribute",
        status: 409,
        title: "Invalid Attribute in Resource",
        detail: "The attrbute " + invalidAttr + " does not exist " +
          "in resource of type " + resourceType
      };
    },
    invalidValue: (invalidValue: string, invalidAttr: string) => {
      return {
        code: "dataErrors.invalidValue",
        status: 409,
        title: "Invalid Value for " + invalidAttr,
        detail: invalidValue + " is didn't follow format rules " +
          " as expected for " + invalidAttr
      };
    }
  }
};
