/**
 * Implements utility functions for validating strings
 */

import shortid = require("shortid");

/**
 * Represents a function that uses StringValidator object methods
 * to determine if a string is valid
 */
export type CheckerFunc = (validator: StringValidator) => boolean;

/**
 * Represenes the list of string validating functions defined the program
 */
export interface ChecksInterface {
  [index: string]: CheckerFunc;
}

/**
 * A class which provides utility functions to check contents of a string
 * @class
 */
export class StringValidator {
  /** Tells whether the string is valid */
  public valid: boolean;
  /** The field to be validated */
  private field: string;
  /** `checkerFunc` used to verify the field */
  private checker: CheckerFunc;

  /**
   * @param  {string} field The string to be checked
   * @param  {CheckerFunc} checker a checker function from
   * `StringValidator.checks` which will be used to validate `field`
   */
  constructor(field: string, checker: CheckerFunc) {
    this.field = field;
    this.checker = checker;
    this.valid = this.validate();
  }

  /**
   * Returns the string being validated
   */
  public getField() {
    return this.field;
  }
  /**
   * Checks whether the length of the string is in [`low`, `high`]
   * @param  {number} low Lower limit for length
   * @param  {number} high Maximum limit for length
   * @returns
   */
  public lengthBetween(low: number, high: number) {
    return this.field.length >= low && this.field.length <= high;
  }

  /**
   * Checks whether a string has atleast `count` digits.
   * @param  {number} count=1
   * @returns
   */
  public hasNumber(count = 1) {
    return this.field.replace(/[^0-9]/g, "").length >= count;
  }
  /**
   * Checks whether a string has atleast `count` uppercase letters
   * @param  {} count=1
   * @returns
   */
  public hasUpperCase(count = 1) {
    return this.field.replace(/[^A-Z]/g, "").length >= count;
  }

  /**
   * Checks whether a string has atleast `count` lowercase letters
   * @param  {} count=1
   * @returns
   */
  public hasLowerCase(count = 1) {
    return this.field.replace(/[^a-z]/g, "").length >= count;
  }

  /**
   * Checks whether a string has atleast `count` special characters
   * @param  {} count=1
   * @returns
   */
  public hasSpecialChar(count = 1) {
    return this.field.replace(
      /[^!@#$%^&*()_+/-=,.\[\]{};:'"|<>\/?]/g, "").length >= count;
  }

  /**
   * Checks whether a string is a valid shortid
   * @returns
   */
  public isValidID() {
    return shortid.isValid(this.field);
  }

  /**
   * Uses the object's `checkerFunc` to check if a string is valid
   * @returns
   */
  private validate() {
    return this.checker(this);
  }
}

/**
 * A `checkerFunc` for a password field
 * @param validator
 * @returns
 */
const password: CheckerFunc = (validator: StringValidator) => {
  return validator.lengthBetween(5, 12)
    && validator.hasUpperCase()
    && validator.hasLowerCase()
    && validator.hasNumber();
};

/**
 * A `checkerFunc` for a resource ID.
 * @param validator
 * @returns
 */
const id: CheckerFunc = (val: StringValidator) => {
  return val.isValidID();
};

/**
 * A `checkerFunc` for a resource name
 * @param validator
 * @returns
 */
const name: CheckerFunc = (val: StringValidator) => {
  return val.lengthBetween(1, 20)
    && !(val.hasSpecialChar());
};

/**
 * A `checkerFunc` for a resource description
 * @param validator
 * @returns
 */
const description: CheckerFunc = (val: StringValidator) => {
  return val.lengthBetween(0, 80);
};

/**
 * A `checkerFunc` for a resource image
 * @param validator
 * @returns
 */
const image: CheckerFunc = (_1: StringValidator) => {
  // To be implemented
  return true;
};

/**
 * A `checkerFunc` for a resource color
 * @param validator
 * @returns
 */
const color: CheckerFunc = (val: StringValidator) => {
  return val.getField()[0] === "#" &&
    val.lengthBetween(7, 7);
};

/** Predefined `checkerFuncs` for various fields */
export let checks: ChecksInterface = {
  password,
  id,
  name,
  description,
  image,
  color
};
