import { join } from "path";

import express = require("express");
import multer = require("multer");
import shortid = require("shortid");

import { config } from "../../config";
import { asyncMiddleware } from "../utils/asyncMiddleware";
import { JSONResponse } from "../utils/JSONResponse";
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

const merges = [{
  id: "0",
  createdAt: "2018-05-24T19:29:26.879Z",
  ties: [] as |Tie[],
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

    // await promisify(rimraf)(config.database.mergeTemp);
    // await promisify(mkdir)(config.database.mergeTemp);
    JSONResponse.Data(res, {});
  }
  )
);

router.delete("/merges/:mergeID", (req, res) => {
  console.log(req.params.mergeID);
  JSONResponse.Data(res, {});
});
