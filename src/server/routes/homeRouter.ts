/**
 * Routes for /*
 *
 * Home page router
 *
 * routes:
 *
 * GET /: Show home page
 */
import express = require("express");

export const router = express.Router();

router.use((_REQ, res, next) => {
  res.setHeader("Cache-Control", "no-cache,no-store,max-age=0," +
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

const pageNames: Map<string, string> = new Map(
  [["elections", "Elections"], ["settings", "Settings"]]);

const navlinks: Array<[string, string, string]> = [
  ["/elections", "Elections", "fab fa-dropbox"],
  ["/settings", "Settings", "fas fa-cog"],
  ["/users/logout", "Log Out", "fas fa-sign-out-alt"]];

/**
 * Route to display various app pages after logged in
 * @name get/:pageName
 * @function
 */
router.get("/:pageName(elections|settings)?", (req, res) => {
  res.render("index.html", {
    appName: "edison-central",
    pageTitle: pageNames.get(req.params.pageName),
    currentURL: `/${req.params.pageName}`,
    navlinks: navlinks
  });
});
