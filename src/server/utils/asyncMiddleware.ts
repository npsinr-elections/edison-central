/**
 * Implements an asynchronous express request handler.
 */

import { RequestHandler } from "express";

/**
 * Wraps an async request handler with a promise that resolves
 * on request. If the request handler returns an error, next()
 * is called to handle the error.
 * @param fn An async request handler function
 * @returns Returns the wrapped request handler function.
 */
export function asyncMiddleware(fn: RequestHandler): RequestHandler {
    const requestHandler: RequestHandler = (req, res, next) =>
        Promise.resolve(fn(req, res, next)).catch(next);

    return requestHandler;
}
