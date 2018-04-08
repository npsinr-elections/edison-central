/* Implements a simple String Validation class
 with multiple validation rules */

type CheckerFunc = (validator: StringValidator) => boolean;

interface ChecksInterface {
    [index: string]: CheckerFunc;
}

export class StringValidator {
    public valid: boolean;
    private field: string;
    private checker: CheckerFunc;

    constructor(field: string, checker: CheckerFunc) {
        this.field = field;
        this.checker = checker;
        this.valid = this.validate();
    }

    public getField() {
        return this.field;
    }

    public setField(field: string) {
        this.field = field;
    }

    public lengthBetween(low: number, high: number) {
        return this.field.length >= low && this.field.length <= high;
    }

    public hasNumber(count = 1) {
        return this.field.replace(/[^0-9]/g, "").length >= count;
    }

    public hasUpperCase(count = 1) {
        return this.field.replace(/[^A-Z]/g, "").length >= count;
    }

    public hasLowerCase(count = 1) {
        return this.field.replace(/[^a-z]/g, "").length >= count;
    }

    public hasSpecialChar(count = 1) {
        return this.field.replace(
            /[^!@#$%^&*()_+/-=,.\[\]{};:'"|<>\/?]/g, "").length >= count;
    }

    private validate() {
        return this.checker(this);
    }
}

const password: CheckerFunc = (validator: StringValidator) => {
    return validator.lengthBetween(5, 12)
        && validator.hasUpperCase()
        && validator.hasLowerCase()
        && validator.hasNumber();
};

export let checks: ChecksInterface = {password};
