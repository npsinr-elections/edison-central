import Datastore = require("nedb");
import { config } from "../../config";

import {generate} from "shortid";

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
  group: string;
}

type Resource = Election | Poll | Candidate;

export function dbfind(datastore: Datastore, query: any): Promise<any[]> {
  return new Promise((resolve, reject) => {
    datastore.find(query, (err: any, docs: any[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });
}

export function dbInsert(datastore: Datastore, doc: any) {
  return new Promise((resolve, reject) => {
      datastore.insert(doc, (err: any, newDocs: any) => {
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

export function dbUpdate(datastore: Datastore,
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
      autoload: true
    });
  }
  // TODO: No await in loops
  public async getElections() {
    const elections = await dbfind(this.db, { type: "election" });
    for (const election of elections) {
      election.polls = await (this.getPolls(election.id));
    }
    return elections;
  }

  public async getPolls(electionID: string) {
    const polls = await this.getChildren(electionID);
    for (const poll of polls) {
      poll.candidates = await this.getChildren(poll.id);
    }
    return polls;
  }

  public async getElection(electionID: string) {
    const election = (await this.getResourceByID(electionID)) as Election;
    election.polls = await this.getPolls(electionID);
    return election;
  }

  public async getPoll(pollID: string) {
    const poll = (await this.getResourceByID(pollID)) as Poll;
    poll.candidates = await this.getChildren(poll.id);
    return poll;
  }

  public async getResourceByID(id: string): Promise<Resource> {
    return (await dbfind(this.db, {id}))[0];
  }

  public async getChildren(parentID: string) {
    return (await dbfind(this.db, {parentID}));
  }

  public async createResource(resource: Resource,
                              type: string,
                              parentID?: string) {
    resource.type = type;
    resource.id = generate();
    if (parentID !== undefined) {
      (resource as Poll | Candidate).parentID = parentID;
    }
    return await dbInsert(this.db, resource);
  }

  public async deleteElection(electionID: string) {
    await dbRemove(this.db, {id: electionID});
    const polls: Poll[] = await this.getChildren(electionID);
    polls.forEach((poll: Poll) => {
      this.deletePoll(poll.id);
    });
    return {};
  }

  public async deletePoll(pollID: string) {
    await dbRemove(this.db, {id: pollID});
    const candidates: Candidate[] = await this.getChildren(pollID);
    candidates.forEach((candidate: Candidate) => {
      this.deleteCandidate(candidate.id);
    });
    return {};
  }

  public async deleteCandidate(candidateID: string) {
    await dbRemove(this.db, {id: candidateID});
    return {};
  }

  public async updateResource(id: string, resource: Resource) {
    return await dbUpdate(this.db, {id}, {$set: resource}, {});
  }
}

export const db = new ElectionsDatastore();
