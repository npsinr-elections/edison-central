/**
 * Utility functions for running client tests.
 * @module test/client/utils
 */

import * as puppeteer from "puppeteer";

/**
 * Get text from a DOM element in the page
 * @param  {puppeteer.Page} page
 * @param  {string} selector
 */
export async function getElemText(page: puppeteer.Page,
                                  selector: string): Promise<string> {
    return await page.evaluate(
        (element) => document.querySelector(element).textContent, selector);
}

/**
 * Extract the url from a pupeteer response
 * @param  {puppeteer.Response} res
 */
export function getURL(res: puppeteer.Response): string {
    const url = res.url();
    return url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Sleep for `ms` milliseconds
 * @param  {number} ms
 */
export function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export const pageLoaded: puppeteer.NavigationOptions = {
    waitUntil: ["domcontentloaded", "networkidle0"]
};
