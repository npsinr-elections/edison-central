import * as puppeteer from "puppeteer";

import { expect } from "chai";
import * as fs from "fs";
import "mocha";

import { config } from "../../config";
import { ERRORS } from "../../server/utils/JSONResponse";
import * as utils from "./utils";

let browser: puppeteer.Browser;
let page: puppeteer.Page;

const BASEURL = "http://localhost:3000";
const ROUTES = {
  register: BASEURL + "/users/register",
  login: BASEURL + "/users/login",
  home: BASEURL + "/elections"
};

describe("User Routes", function() {
  this.timeout(100000);
  before(async () => {
    try {
      fs.unlinkSync(config.database.users);
    } catch (err) {
      // If ENOENT then just catch error.
    }

    browser = await puppeteer.launch({
      args: ["--no-sandbox"]
    });
    page = await browser.newPage();
  });

  it("Redirects to /register if not registered", async () => {
    let res = await page.goto(BASEURL);
    expect(utils.getURL(res)).to.equal(ROUTES.register);

    res = await page.goto(ROUTES.login);
    expect(utils.getURL(res)).to.equal(ROUTES.register);
  });

  it("Registers only valid password string", async () => {
    await page.goto(ROUTES.register, utils.pageLoaded);
    const invalids = [
      "test",
      "Testing",
      "AbraCaDabra12345",
      "test123"
    ];

    await page.focus("[type=\"password\"]");
    let errorText: string;
    for (const invalid of invalids) {
      await page.keyboard.type(invalid);
      await page.click("[type=\"submit\"]");
      await utils.sleep(300); // Wait for error animation
      await page.waitForSelector("#errorDisplay", {
        visible: true
      });

      errorText = await utils.getElemText(page, "#errorTitle");
      expect(errorText).to.equal(ERRORS.UserErrors.InvalidPassword.title);
    }

    await page.keyboard.type("Test123"); // Valid Password
    page.click("[type=\"submit\"]");

    // Redirect to login after register
    const res = await page.waitForNavigation();
    expect(utils.getURL(res)).to.equal(ROUTES.login);
  });

  it("Redirects to /login if registered and not logged in", async () => {
    let res = await page.goto(BASEURL);
    expect(utils.getURL(res)).to.equal(ROUTES.login);

    // Make sure user can't re-register.
    res = await page.goto(ROUTES.register);
    expect(utils.getURL(res)).to.equal(ROUTES.login);
  });

  it("Logs in only with valid password", async () => {
    await page.goto(ROUTES.register, utils.pageLoaded);
    const invalids = [
      "testing123",
      "Tes123",
      "AbraCaDabra12345",
      "test123"
    ];

    await page.focus("[type=\"password\"]");
    let errorText: string;
    for (const invalid of invalids) {
      await page.keyboard.type(invalid);
      await page.click("[type=\"submit\"]");
      await utils.sleep(300); // Wait for error animation
      await page.waitForSelector("#errorDisplay", {
        visible: true
      });

      errorText = await utils.getElemText(page, "#errorTitle");
      expect(errorText).to.equal(ERRORS.UserErrors.LoginIncorrect.title);
    }

    await page.keyboard.type("Test123"); // Correct Password
    page.click("[type=\"submit\"]");
    // Redirect to home after login
    const res = await page.waitForNavigation();
    expect(utils.getURL(res)).to.equal(ROUTES.home);
  });

  after(async () => {
    await browser.close();
  });
});
