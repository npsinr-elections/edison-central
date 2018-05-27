import { unlink } from "fs";
import { join } from "path";

import express = require("express");
import multer = require("multer");
import shortid = require("shortid");

import { promisify } from "util";
import { config } from "../../config";
import { Election } from "../model/elections";
import { asyncMiddleware } from "../utils/asyncMiddleware";
import { JSONResponse } from "../utils/JSONResponse";
import * as merge from "../utils/merge";
import { extractZipFile } from "../utils/zipAndUnzip";

export const router = express.Router();

const storage = multer.diskStorage({
  destination: config.database.mergeTemp,
  filename: (_REQ, _FILE, cb) => {
    cb(null, shortid.generate() + ".zip");
  }
});

const upload = multer({ storage });

interface Tie {
  pollName: string;
  candidates: string[];
}

interface Merge {
  id: string;
  mergedFile: string;
  createdAt: string;
  ties: Tie[];
  polls: Array<{
    name: string,
    votes: number
  }>;
}
const merges: Merge[] = [{
  id: "0",
  mergedFile: "merge_1.db",
  createdAt: "2018-05-24T19:29:26.879Z",
  ties: [],
  polls: [
    { name: "Best Cape", votes: 10 },
    { name: "Best Library", votes: 10 },
    { name: "Best Shoes", votes: 10 }
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
});

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

router.post(
  "/merges",
  upload.array("results"),
  asyncMiddleware(async (req, res) => {
    const extractFilePromises: Array<Promise<void>> = [];
    const resultPaths: string[] = [];

    // req.files is declared a union type
    // but upload.array() gives an array
    for (const file of req.files as Express.Multer.File[]) {
      const destPath = join(
        config.database.mergeTemp,
        shortid.generate()
      );

      extractFilePromises.push(
        extractZipFile(file.path, destPath)
      );

      resultPaths.push(destPath);
    }
    await Promise.all(extractFilePromises);
    await merge.mergeDBs(resultPaths);
    JSONResponse.Data(res, {});

    const delFilesPromise = Promise.all([
      (req.files as Express.Multer.File[]).map(
        (value) => {
          return promisify(unlink)(value.path);
        }
      )
    ]);

    await delFilesPromise;
  }
  )
);

router.delete("/merges/:mergeID", (req, res) => {
  console.log(req.params.mergeID);
  JSONResponse.Data(res, {});
});
