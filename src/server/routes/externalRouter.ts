import express = require("express");
import fs = require("fs");
import { join } from "path";
import request = require("request");
import { generate } from "shortid";

import { config } from "../../config";
import { db as elections } from "../model/elections";
import { uploadMerge } from "../model/merges";
import { asyncMiddleware } from "../utils/asyncMiddleware";
import { ERRORS, JSONResponse } from "../utils/JSONResponse";

export const router = express.Router();

router.get("/getElections", asyncMiddleware(async (_REQ, res) => {
  res.json(await elections.getElections());
}));

router.get("/elections/:electionID/export",
  asyncMiddleware(async (req, res) => {
    let pollIDs: string[];
    if (req.query.all === "true") {
      const election = (await elections.getElection(req.params.electionID));
      pollIDs = election.polls.map((poll) => poll.id);
    } else {
      pollIDs = req.query.pollIDs;
    }

    if (pollIDs === undefined) {
      return JSONResponse.Error(res, ERRORS.ResourceError.NotFound);
    }
    const zipFile = await elections.exportElection(
      req.params.electionID, pollIDs);
    res.download(zipFile, () => {
      fs.unlink(zipFile, () => undefined);
    });
  })
);

router.get("/import/booths",
  asyncMiddleware(async (req, res) => {
    const boothIPs: string = req.query.boothIPs;
    if (boothIPs === undefined) {
      return JSONResponse.Error(res, ERRORS.ResourceError.NotFound);
    }

    const IPList = boothIPs.split(",");
    const filePaths: string[] = await Promise.all(IPList.map((IP) => {
      return new Promise((resolve) => {
        const outZip = join(config.database.mergeTemp, generate() + ".zip");

        request("http://" + IP + ":5000/external/export")
          .on("error", () => {
            resolve("");
          })
          .pipe(fs.createWriteStream(outZip))
          .on("finish", () => {
            resolve(outZip);
          });
      });
    }) as Array<Promise<string>>);
    for (const path of filePaths) {
      if (path === "") {
        return JSONResponse.Error(res, ERRORS.ResourceError.NotFound);
      }
    }
    await uploadMerge(filePaths);
    res.redirect("/merges");
  }));
