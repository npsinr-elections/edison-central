import { unlink } from "fs";
import { join } from "path";

import express = require("express");
import ip = require("ip");
import multer = require("multer");
import shortid = require("shortid");

import { promisify } from "util";
import { config } from "../../config";
import { db as merges } from "../model/merges";
import { asyncMiddleware } from "../utils/asyncMiddleware";
import { ERRORS, JSONResponse } from "../utils/JSONResponse";
import { extractZipFile } from "../utils/zipAndUnzip";

export const router = express.Router();

const storage = multer.diskStorage({
  destination: config.database.mergeTemp,
  filename: (_REQ, _FILE, cb) => {
    cb(null, shortid.generate() + ".zip");
  }
});

const upload = multer({ storage });

router.get("/merges", asyncMiddleware(async (req, res) => {
  res.render(
    "merges.html", {
      appName: config.appName,
      currentURL: req.url,
      pageTitle: "Merges",
      merges: await merges.getMerges(),
      lanIP: ip.address()
    }
  );
}));

router.get("/merges/:mergeID/results", asyncMiddleware(async (req, res) => {
  const merge = await merges.getMergeByID(req.params.mergeID);
  const winnerIDs: {[id: string]: string[]} = {};
  merge.merged.polls.map((poll) => {
    winnerIDs[poll.id] = poll.winners.map((winner) => winner.id);
  });
  res.render(
    "results-table.html", {
      appName: config.appName,
      lanIP: ip.address(),
      currentURL: req.url,
      pageTitle: "Results",
      election: merge.merged,
      winnerIDs: winnerIDs
    }
  );
}));

router.get("/merges/:mergeID/present", asyncMiddleware(async (req, res) => {
  const merge = await merges.getMergeByID(req.params.mergeID);
  const winnerIDs: {[id: string]: string[]} = {};
  merge.merged.polls.map((poll) => {
    winnerIDs[poll.id] = poll.winners.map((winner) => winner.id);
  });
  res.render(
    "present/present.html", {
      election: merge.merged,
      winnerIDs: winnerIDs
    }
  );
 }
));

router.get("/merges/new", (req, res) => {
  res.render(
    "forms/merge-edit.html", {
      appName: config.appName,
      lanIP: ip.address(),
      currentURL: req.url,
      pageTitle: "Create Merge"
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
    await merges.newMerge(resultPaths);
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

router.delete("/merges/:mergeID", asyncMiddleware(async (req, res) => {
  const numRemoved = await merges.deleteMerge(req.params.mergeID);
  if (numRemoved > 0) {
    JSONResponse.Data(res, { numRemoved });
  } else {
    JSONResponse.Error(res, ERRORS.ResourceError.NotFound);
  }
}));
