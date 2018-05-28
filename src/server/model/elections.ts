import * as zip from "adm-zip";
import { copyFile, mkdir, unlink } from "fs";
import Datastore = require("nedb");
import path = require("path");
import rimraf = require("rimraf");
import { generate } from "shortid";
import { promisify } from "util";

import { config } from "../../config";
import { Candidate, Election, Image, Poll } from "../../shared/models";
import { dbfind, dbInsert, dbRemove, dbUpdate } from "../utils/database";

const copyFilePromise = promisify(copyFile);
const mkdirPromise = promisify(mkdir);
const unlinkPromise = promisify(unlink);
const rimrafPromise = promisify(rimraf);

export type Resource = Election | Poll | Candidate | Image;

export type NonImageResource = Election | Poll | Candidate;

export function zipElection(
  dbFile: string,
  imagesDir: string,
  destination: string): void {
  const zipper: zip = new zip();
  zipper.addLocalFile(dbFile);
  zipper.addLocalFile(config.database.users);
  zipper.addLocalFolder(imagesDir, "images");
  zipper.writeZip(destination);
}

class ElectionsDatastore {
  public db: Datastore;
  constructor() {
    this.db = new Datastore({
      filename: config.database.elections,
      autoload: true,
      timestampData: true
    });
  }
  public async getElections(): Promise<Election[]> {
    const elections: Election[] = await dbfind(this.db, { type: "election" });
    return await Promise.all(elections.map((value) => {
      return this.getElection(value.id);
    }));
  }

  public async getPolls(electionID: string): Promise<Poll[]> {
    const polls: Poll[] = (await this.getChildren(electionID)) as Poll[];
    return await Promise.all(polls.map((value) => {
      return this.getPoll(value.id);
    }));
  }

  public async getElection(electionID: string): Promise<Election> {
    const election = (
      await this.getResourceByID(
        electionID, "election")) as Election;
    if (election === undefined) {
      return undefined;
    }
    election.polls = await this.getPolls(electionID);
    return election;
  }

  public async getPoll(pollID: string): Promise<Poll> {
    const poll = (
      await this.getResourceByID(
        pollID, "poll")) as Poll;
    if (poll === undefined) {
      return undefined;
    }
    poll.candidates = (await this.getChildren(poll.id)) as Candidate[];
    return poll;
  }

  public async getResourceByID(id: string, type?: string): Promise<Resource> {
    let resource: Resource[];
    if (type !== undefined) {
      resource = (await dbfind(this.db, { id, type }));
    } else {
      resource = (await dbfind(this.db, { id }));
    }
    if (resource.length === 0) {
      return undefined;
    } else {
      return resource[0];
    }
  }

  public async getResourceImage(resourceID: string): Promise<Image> {
    const image = (await dbfind(
      this.db, { resourceID: resourceID, type: "image" }));
    if (image.length === 0) {
      return undefined;
    } else {
      return image[0];
    }
  }
  public async getCandidateFallbacks(candidatePollID: string) {
    const parentElectionID = (await db.getPoll(candidatePollID)).parentID;
    const polls = await db.getPolls(parentElectionID);
    return polls.filter((poll) => {
      return poll.id !== candidatePollID;
    });
  }

  public async setFallbackName(candidate: Candidate) {
    if (candidate.fallback === "_none_") {
      candidate.fallbackName = "None";
    } else {
      candidate.fallbackName = (await this.getPoll(candidate.fallback)).name;
    }
  }

  public async getChildren(parentID: string): Promise<Poll[] | Candidate[]> {
    return (await dbfind(this.db, { parentID }));
  }

  public async createResource(
    resource: Resource,
    type: string,
    parentID?: string,
    id?: string) {
    resource.type = type;
    resource.id = id || generate();
    if (parentID !== undefined) {
      (resource as Poll | Candidate).parentID = parentID;
    }

    if (resource.type === "candidate") {
      (resource as Candidate).votes = 0;
    }

    return await dbInsert(this.db, resource);
  }

  public async deleteElection(electionID: string) {
    const numDeleted = await dbRemove(this.db, { id: electionID });
    const polls: Poll[] = (await this.getChildren(electionID)) as Poll[];
    polls.forEach((poll: Poll) => {
      this.deletePoll(poll.id);
    });
    await this.deleteImage(electionID);
    return numDeleted;
  }

  public async deletePoll(pollID: string) {
    const numDeleted = await dbRemove(this.db, { id: pollID });
    const candidates: Candidate[] = (await this.getChildren(
      pollID)) as Candidate[];
    candidates.forEach((candidate: Candidate) => {
      this.deleteCandidate(candidate.id);
    });

    await this.removeFallback(pollID);
    return numDeleted;
  }

  public async deleteCandidate(candidateID: string) {
    const numDeleted = await dbRemove(this.db, { id: candidateID });
    await this.deleteImage(candidateID);
    return numDeleted;
  }

  public async deleteImage(resourceID: string) {
    const image = (await this.getResourceImage(resourceID));
    if (image === undefined) {
      // Should be a dummy image
      return;
    }
    await unlinkPromise(path.join(config.database.images, image.id));
    return await dbRemove(this.db, { type: "image", id: image.id });
  }
  public async updateResource(id: string, resource: Resource) {
    await dbUpdate(this.db, { id }, { $set: resource }, {});
    return await this.getResourceByID(id);
  }

  public async exportElection(electionID: string, pollIDs: string[]) {
    const { polls, ...exportElection } = await this.getElection(electionID);
    const exportCandidates: Candidate[] = [];
    const exportPolls: Poll[] = polls
    .filter((poll) => {
      return pollIDs.indexOf(poll.id) > -1;
    })
    .map((poll) => {
      const { candidates, ...exportPoll } = poll;
      exportCandidates.push(...candidates);
      return exportPoll;
    });
    const exportResources: NonImageResource[] = [
      exportElection as NonImageResource
    ]
      .concat(exportPolls, exportCandidates);

    const tmpDir = path.join(config.database.exportTemp, generate());
    const tmpDirImages = path.join(tmpDir, "images");
    await mkdirPromise(tmpDir);
    await mkdirPromise(tmpDirImages);

    const tmpDB = path.join(
      tmpDir, `export${generate()}.db`);
    const exportDB = new Datastore({
      filename: tmpDB,
      autoload: true
    });

    await Promise.all(exportResources.map((resource) => {
      return dbInsert(exportDB, resource);
    }));
    await Promise.all(exportResources.map((resource) => {
      if (resource.image === undefined) {
        return;
      }
      const image = path.basename(resource.image);
      if (["candidate-default.jpg", "election-default.jpg"]
        .every((value) => value !== image)) {
        const src = path.join(config.database.images, image);
        const dest = path.join(tmpDirImages, image);
        return copyFilePromise(src, dest);
      }
    }));

    const zipFile = path.join(
      config.database.exportTemp,
      `export_${exportElection.name.replace(" ", "_")}_`
      + `${generate()}.zip`);

    await zipElection(tmpDB, tmpDirImages, zipFile);
    await rimrafPromise(tmpDir);

    return zipFile;
  }

  private async removeFallback(fallback: string) {
      return await dbUpdate(
        this.db,
        { fallback },
        { $set: {fallback: "_none_"}},
        {});
  }
}

export const db = new ElectionsDatastore();
