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
 * Route to return sections of other pages
 * @name get/pages/:pageName
 * @function
 */
router.get("/pages/:pageName", (req, res) => {
    res.render(req.params.pageName + ".html");
});

/**
 * Route to display various app pages after logged in
 * @name get/:pageName
 * @function
 */
router.get("/:pageName(elections|templates|results|settings)?", (_REQ, res) => {
    res.render("index.html");
});
