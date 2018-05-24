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

import { Candidate, db, Election, Poll} from "../model/elections";
import { asyncMiddleware } from "../utils/asyncMiddleware";
import {JSONResponse} from "../utils/JSONResponse";

export const router = express.Router();

const emptyElection: Election = {
  id: "",
  name: "",
  type: "election",
  caption: "",
  color: "",
  image: "",
  polls: []
};

const emptyPoll: Poll = {
  id: "",
  name: "",
  type: "poll",
  caption: "",
  color: "",
  candidates: [],
  parentID: "",
  group: ""
};

const emptyCandidate: Candidate = {
  id: "",
  name: "",
  type: "candidate",
  image: "",
  parentID: "",
  votes: 0,
  group: ""
};

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
router.get("/elections", asyncMiddleware(async (req, res) => {
  res.render("elections.html", {
    appName: config.appName,
    pageTitle: pageNames.get("elections"),
    currentURL: req.url,
    elections: await db.getElections()
  });
}));

// Requests for create pages

router.get("/elections/new", asyncMiddleware(async (req, res) => {
  res.render("forms/election-edit.html", {
    appName: config.appName,
    pageTitle: "New Election",
    currentURL: req.url,
    election: emptyElection,
    formURL: req.url.slice(0, -4),
    method: "POST"
  });
}));

router.get("/elections/:electionID/polls/new",
      asyncMiddleware(async (req, res) => {
  res.render("forms/poll-edit.html", {
    appName: config.appName,
    pageTitle: "New Poll",
    currentURL: req.url,
    poll: emptyPoll,
    formURL: req.url.slice(0, -4),
    method: "POST"
  });
}));

router.get("/candidates/:candidateID/new",
          asyncMiddleware(async (req, res) => {
  res.render("forms/candidate-edit.html", {
    appName: config.appName,
    pageTitle: "New Candidate",
    currentURL: req.url,
    candidate: emptyCandidate,
    formURL: req.url.slice(0, -4),
    method: "POST"
  });
}));

// Requests for edit pages

router.get("/elections/:electionID/edit", asyncMiddleware(async (req, res) => {
  res.render("forms/election-edit.html", {
    appName: config.appName,
    pageTitle: "Edit Elections",
    currentURL: req.url,
    election: await db.getElection(req.params.electionID),
    method: "PUT"
  });
}));

router.get("/polls/:pollID/edit", asyncMiddleware(async (req, res) => {
  const poll = await db.getPoll(req.params.pollID);
  res.render("forms/poll-edit.html", {
    appName: config.appName,
    pageTitle: `Edit Poll ${poll.name}`,
    currentURL: req.url,
    poll: poll,
    method: "PUT"
  });
}));

router.get("/candidates/:candidateID/edit",
          asyncMiddleware(async (req, res) => {
  const candidate = await db.getResourceByID(req.params.candidateID);
  res.render("forms/candidate-edit.html", {
    appName: config.appName,
    pageTitle: `Edit Candidate ${candidate.name}`,
    currentURL: req.url,
    candidate: candidate,
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

router.delete("/elections/:electionID",
              asyncMiddleware(async (req, res) => {
  JSONResponse.Data(res, await db.deleteElection(req.params.electionID));
}));

router.delete("/polls/:pollID",
              asyncMiddleware(async (req, res) => {
  JSONResponse.Data(res, await db.deletePoll(req.params.pollID));
}));

router.delete("/candidates/:candidateID",
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
  });
});
