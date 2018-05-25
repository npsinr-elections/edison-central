import express = require("express");
// import multer = require("multer");
// import path = require("path");
// import shortid = require("shortid");

import { config } from "../../config";

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

router.get("/merges/new", (req, res) => {
  res.render(
    "forms/merge-edit.html", {
      appName: config.appName,
      currentURL: req.url,
      pageTitle: "Create Merge",
    }
  );
});
