/**
 * Routes for /*
 *
 * Home page router
 *
 * routes:
 *
 * GET /: Show home page
 * @module server/routes/homeRouter
 */
import express = require("express");

export const router = express.Router();

/**
 * Route to display home page
 * @name get/
 * @function
 */
router.get("/", (_REQ, res) => {
    const date = new Date();
    res.render("index.html", {date});
});
