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

import { config } from "../../config";

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
 * Redirects requests to /elections from root
 * @name /
 * @function
 */
router.get("/", (_REQ, res) => {
  res.redirect("/elections");
});

/**
 * Route to display the elections page
 * @name /elections
 * @function
 */
router.get("/elections", (_REQ, res) => {
  res.render("elections.html", {
    appName: config.appName,
    pageTitle: pageNames.get("elections"),
    currentURL: "/elections",
    navlinks: navlinks,
    // Dummy data for elections.
    // TODO replace with data from file
    elections: [
      {
        name: "Best Superhero",
        polls: [
          {
            name: "Best Cape",
            candidates: [
              {
                name: "Superman"
              },
              {
                name: "Batman"
              }
            ]
          },
        ]
      }, {
        name: "Best Superhero",
        polls: [
          {
            name: "Best Cape",
            candidates: [
              {
                name: "Superman"
              },
              {
                name: "Batman"
              }
            ]
          },
        ]
      }
    ]
  });
});

router.get("/elections/:electionID/edit", (req, res) => {
  res.render("forms/election-edit.html", {
    appName: config.appName,
    pageTitle: "Edit Elections",
    currentURL: req.url,
    navlinks: navlinks,
    id: req.params.electionID,
    method: "PUT"
  });
});

router.get("/settings", (_REQ, res) => {
  res.render("settings.html", {
    appName: config.appName,
    pageTitle: pageNames.get("settings"),
    currentURL: "/settings",
    navlinks: navlinks
  });
});
