import * as puppeteer from "puppeteer";
import * as url from "url";

import {expect} from "chai";
import "mocha";

let browser: puppeteer.Browser;
let page: puppeteer.Page;

// tslint:disable-next-line:only-arrow-functions
describe("User Routes", function() {
    this.timeout(50000);
    before(async () => {
        browser = await puppeteer.launch({
            args: ["--no-sandbox"]});
        page = await browser.newPage();
    });

    it("Redirects if not logged in", async () => {
        const res = await page.goto("http://localhost:3000");
        expect(url.parse(res.url()).pathname).equals("/users/login");
    });

    after(async () => {
        await browser.close();
    });
});
