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

import { db } from "../model/elections";
import { asyncMiddleware } from "../utils/asyncMiddleware";
import {JSONResponse} from "../utils/JSONResponse";

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
router.get("/elections", asyncMiddleware(async (_REQ, res) => {
  res.render("elections.html", {
    appName: config.appName,
    pageTitle: pageNames.get("elections"),
    currentURL: "/elections",
    navlinks: navlinks,
    // Dummy data for elections.
    // TODO replace with data from file
    elections: await db.getElections()
  });
}));

router.get("/elections/:electionID/edit", asyncMiddleware(async (req, res) => {
  res.render("forms/election-edit.html", {
    appName: config.appName,
    pageTitle: "Edit Elections",
    currentURL: req.url,
    navlinks: navlinks,
    election: await db.getElection(req.params.electionID),
    method: "PUT"
  });
}));

// Requests for creating resources

router.post("/elections", asyncMiddleware(async (req, res) => {
  JSONResponse.Data(res, await db.createResource(req.body, "election"));
}));

router.post("/elections/:electionID/polls",
            asyncMiddleware(async (req, res) => {
  JSONResponse.Data(res, await db.createResource(req.body,
    "poll", req.params.electionID));
}));

router.post("/polls/:pollID/candidates",
            asyncMiddleware(async (req, res) => {
  JSONResponse.Data(res, await db.createResource(req.body,
    "candidate", req.params.pollID));
}));

// Requests for deleting resources

router.delete("/elections:electionID",
              asyncMiddleware(async (req, res) => {
  JSONResponse.Data(res, await db.deleteElection(req.params.electionID));
}));

router.delete("/polls:pollID",
              asyncMiddleware(async (req, res) => {
  JSONResponse.Data(res, await db.deletePoll(req.params.pollID));
}));

router.delete("/candidates:candidateID",
              asyncMiddleware(async (req, res) => {
  JSONResponse.Data(res, await db.deleteCandidate(req.params.candidateID));
}));

// Requests for updating resources
router.put("/:resourceType(elections|polls|candidates)/:resourceID",
           asyncMiddleware(async (req, res) => {
  JSONResponse.Data(res, await db.updateResource(req.params.resourceID,
                                                 req.body));
}));

router.get("/settings", (_REQ, res) => {
  res.render("settings.html", {
    appName: config.appName,
    pageTitle: pageNames.get("settings"),
    currentURL: "/settings",
    navlinks: navlinks
  });
});
