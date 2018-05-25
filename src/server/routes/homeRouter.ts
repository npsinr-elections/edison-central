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
import multer = require("multer");
import path = require("path");
import shortid = require("shortid");

import { config } from "../../config";

import { Candidate, db, Election, Poll } from "../model/elections";
import { asyncMiddleware } from "../utils/asyncMiddleware";
import { ERRORS, JSONResponse } from "../utils/JSONResponse";

export const router = express.Router();

const storage = multer.diskStorage({
  destination: config.database.images,
  filename: (_REQ, file, cb) => {
    cb(null, shortid.generate() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const emptyElection: Election = {
  id: "",
  name: "",
  type: "election",
  caption: "",
  color: "",
  image: "/dummy/images/election-default.jpg",
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
  image: "/dummy/images/candidate-default.jpg",
  parentID: "",
  votes: 0,
  fallback: ""
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

router.get(
  "/polls/:pollID/candidates/new",
  asyncMiddleware(async (req, res) => {
    const parentElectionID = ((await db.getResourceByID(
      req.params.pollID, "poll")) as Poll).parentID;
    const polls = await db.getPolls(parentElectionID);
    res.render("forms/candidate-edit.html", {
      appName: config.appName,
      pageTitle: "New Candidate",
      currentURL: req.url,
      candidate: emptyCandidate,
      formURL: req.url.slice(0, -4),
      fallbacks: polls,
      method: "POST"
    });
  }));

// Requests for edit pages

router.get("/elections/:electionID/edit", asyncMiddleware(async (req, res) => {
  const election = await db.getElection(req.params.electionID);
  if (election === undefined) {
    return JSONResponse.Error(res, ERRORS.pageError.notFound);
  }
  res.render("forms/election-edit.html", {
    appName: config.appName,
    pageTitle: "Edit Elections",
    currentURL: req.url,
    election: await db.getElection(req.params.electionID),
    formURL: req.url.slice(0, -5),
    method: "PUT"
  });
}));

router.get("/polls/:pollID/edit", asyncMiddleware(async (req, res) => {
  const poll = (await db.getPoll(req.params.pollID)) as Poll;
  if (poll === undefined) {
    return JSONResponse.Error(res, ERRORS.pageError.notFound);
  }
  await Promise.all(poll.candidates.map((candidate) => {
    return db.setFallbackName(candidate);
  }));

  res.render("forms/poll-edit.html", {
    appName: config.appName,
    pageTitle: "Edit Poll",
    currentURL: req.url,
    poll: poll,
    formURL: req.url.slice(0, -5),
    method: "PUT"
  });
}));

router.get(
  "/candidates/:candidateID/edit",
  asyncMiddleware(async (req, res) => {

    const candidate = (await db.getResourceByID(
      req.params.candidateID, "candidate")) as Candidate;
    if (candidate === undefined) {
      return JSONResponse.Error(res, ERRORS.pageError.notFound);
    }

    const parentPollID = candidate.parentID;
    const parentElectionID = ((await db.getResourceByID(
      parentPollID, "poll"
    )) as Poll).parentID;
    const polls = await db.getPolls(parentElectionID);
    res.render("forms/candidate-edit.html", {
      appName: config.appName,
      pageTitle: "Edit Candidate",
      currentURL: req.url,
      candidate: candidate,
      formURL: req.url.slice(0, -5),
      fallbacks: polls,
      method: "PUT"
    });
  }));
// Requests for creating resources

router.post("/elections",
  upload.single("image"),
  asyncMiddleware(async (req, res) => {
    const electionID = shortid.generate();
    if (req.file === undefined) {
      req.body.image = "/dummy/images/election-default.jpg";
    } else {
      db.createResource({
        id: req.file.filename,
        type: "image",
        resourceID: electionID
      }, "image", undefined, req.file.filename);
      req.body.image = `/images/${req.file.filename}`;
    }
    const newElection = (await db.createResource(
      req.body, "election", undefined, electionID)) as Election;
    JSONResponse.Data(res, newElection);
  }));

router.post(
  "/elections/:electionID/polls",
  upload.single("image"),
  asyncMiddleware(async (req, res) => {
    JSONResponse.Data(res, await db.createResource(req.body,
      "poll", req.params.electionID));
  }));

router.post(
  "/polls/:pollID/candidates",
  upload.single("image"),
  asyncMiddleware(async (req, res) => {
    const candidateID = shortid.generate();
    if (req.file === undefined) {
      req.body.image = "/dummy/images/candidate-default.jpg";
    } else {
      db.createResource({
        id: req.file.filename,
        type: "image",
        resourceID: candidateID
      }, "image", undefined, req.file.filename);
      req.body.image = `/images/${req.file.filename}`;
    }
    const newCandidate = (await db.createResource(
      req.body, "candidate", req.params.pollID, candidateID)) as Candidate;
    JSONResponse.Data(res, newCandidate);
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
router.put(
  "/:resourceType(elections|polls|candidates)/:resourceID",
  upload.single("image"),
  asyncMiddleware(async (req, res) => {
    if (req.file !== undefined) {
      await db.deleteImage(req.params.resourceID);
      await db.createResource({
        id: req.file.filename,
        type: "image",
        resourceID: req.params.resourceID
      }, "image");
      req.body.image = `/images/${req.file.filename}`;
    } else {
      delete req.body.image; // Dont overwrite old image
    }
    const updated = await db.updateResource(req.params.resourceID, req.body);
    JSONResponse.Data(res, updated);
  }));

router.get("/settings", (_REQ, res) => {
  res.render("settings.html", {
    appName: config.appName,
    pageTitle: pageNames.get("settings"),
    currentURL: "/settings",
  });
});
