import fs = require("fs");
import Datastore = require("nedb");
import path = require("path");
import { promisify } from "util";

import { config } from "../../config";

import { generate } from "shortid";

const unlinkPromise = promisify(fs.unlink);

export interface Election {
  id: string;
  type: string;
  name: string;
  caption: string;
  image: string;
  color: string;
  polls?: Poll[];
}

export interface Poll {
  id: string;
  type: string;
  name: string;
  caption: string;
  color: string;
  parentID: string;
  group: string;
  candidates?: Candidate[];
}

export interface Candidate {
  id: string;
  type: string;
  name: string;
  image: string;
  votes: number;
  parentID: string;
  fallback: string;
  fallbackName?: string;
}

export interface Image {
  id: string;
  type: string;
  resourceID: string;
}

type Resource = Election | Poll | Candidate | Image;

export function dbfind(datastore: Datastore, query: any): Promise<any[]> {
  return new Promise((resolve, reject) => {
    datastore.find(query)
      .sort({ createdAt: 1 })
      .exec((err: any, docs: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
  });
}

export function dbInsert<T>(datastore: Datastore, doc: T): Promise<T> {
  return new Promise((resolve, reject) => {
    datastore.insert(doc, (err: any, newDocs: T) => {
      if (err) {
        reject(err);
      } else {
        resolve(newDocs);
      }
    });
  });
}

export function dbRemove(datastore: Datastore, query: any) {
  return new Promise((resolve, reject) => {
    datastore.remove(query, (err: any, numRemoved: number) => {
      if (err) {
        reject(err);
      } else {
        resolve(numRemoved);
      }
    });
  });
}

export function dbUpdate(
  datastore: Datastore,
  query: any,
  update: any,
  options: any) {
  return new Promise((resolve, reject) => {
    datastore.update(query, update, options, (err: any, numRemoved: number) => {
      if (err) {
        reject(err);
      } else {
        resolve(numRemoved);
      }
    });
  });
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
    await dbRemove(this.db, { id: electionID });
    const polls: Poll[] = (await this.getChildren(electionID)) as Poll[];
    polls.forEach((poll: Poll) => {
      this.deletePoll(poll.id);
    });
    await this.deleteImage(electionID);
    return {};
  }

  public async deletePoll(pollID: string) {
    await dbRemove(this.db, { id: pollID });
    const candidates: Candidate[] = (await this.getChildren(
      pollID)) as Candidate[];
    candidates.forEach((candidate: Candidate) => {
      this.deleteCandidate(candidate.id);
    });
    return {};
  }

  public async deleteCandidate(candidateID: string) {
    await dbRemove(this.db, { id: candidateID });
    await this.deleteImage(candidateID);
    return {};
  }

  public async deleteImage(resourceID: string) {
    const image = (await this.getResourceImage(resourceID));
    if (image === undefined) { // Should be a dummy image
      return;
    }
    await unlinkPromise(path.join(config.database.images, image.id));
    return await dbRemove(this.db, { type: "image", id: image.id });
  }
  public async updateResource(id: string, resource: Resource) {
    await dbUpdate(this.db, { id }, { $set: resource }, {});
    return await this.getResourceByID(id);
  }
}

export const db = new ElectionsDatastore();
