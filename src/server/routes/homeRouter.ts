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

router.use((_REQ, res, next) => {
  res.setHeader("Cache-Control", "no-cache,no-store, max-age=0," +
    "must-revalidate");
  next();
});

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
router.get("/:pageName(elections|results|settings)?", (_REQ, res) => {
  res.render("index.html");
});
