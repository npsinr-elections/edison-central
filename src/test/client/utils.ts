import * as puppeteer from "puppeteer";

export async function getElemText(page: puppeteer.Page, selector: string) {
    return await page.evaluate(
        (element) => document.querySelector(element).textContent, selector);
}

export function getURL(res: puppeteer.Response) {
    const url = res.url();
    return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export const pageLoaded: puppeteer.NavigationOptions = {
    waitUntil: ["domcontentloaded", "networkidle0"]
};
