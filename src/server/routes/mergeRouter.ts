import express = require("express");
// import multer = require("multer");
// import path = require("path");
// import shortid = require("shortid");

import { config } from "../../config";
import { Election } from "../model/elections";
export const router = express.Router();

const merges = [{
  id: "0",
  timestamp: "2018-05-24T19:29:26.879Z",
  ties: [] as string[],
  polls: [
    {name: "Best Cape", votes: 10},
    {name: "Best Library", votes: 10},
    {name: "Best Shoes", votes: 10}
  ]
}];

router.get("/merges", (req, res) => {
    res.render(
      "merges.html", {
        appName: config.appName,
        currentURL: req.url,
        pageTitle: "Merges",
        merges: merges
      }
    );
  }
);

const election: Election = {
  id: "1",
  type: "election",
  name: "NPS Elections",
  caption: "Choose Responsibly, Choose Responsibility.",
  image: "../../client/assets/images/election-default.jpg",
  color: "black",
  polls: [{
    id: "2",
    type: "poll",
    name: "Prefect",
    caption : "Reach Out, Reach High, Reach Beyond.",
    color: "red",
    parentID: "1",
    group: "",
    candidates: [{
      id: "3",
      type: "candidate",
      name: "Superman",
      image: "../../client/assets/images/election-default.jpg",
      votes: 1000,
      parentID: "2",
      fallback: "2",
      fallbackName: "Prefect"
    }]
  }]
};

router.get("/merges/:mergeID/present", (_REQ, res) => {
  res.render(
    "../../client/views/results.html", {
      election: election
    }
  );
 }
);

router.get("/merges/new", (req, res) => {
  res.render(
    "forms/merge-edit.html", {
      appName: config.appName,
      currentURL: req.url,
      pageTitle: "Create Merge",
    }
  );
});
