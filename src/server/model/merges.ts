import { config } from "../../config";
import { NonImageResource } from "../model/elections";
import { Candidate } from "../model/elections";
import { dbfind, dbInsert, dbRemove } from "../utils/database";

import Datastore = require("nedb");
import { generate } from "shortid";

interface Merge {
  id: string;
  merged: NonImageResource[];
  createdAt?: string;
  ties: Tie[];
  polls: PollTotal[];
}

interface PollTotal {
  name: string;
  votes: number;
}

export interface Tie {
  pollName: string;
  candidates: string[];
}

function checkforTies(pollCandidates: Candidate[]): string[] {
  console.log("RAN");
  console.log(pollCandidates.toString());
  let candidates: Candidate[] = [];
  for (const candidate of pollCandidates) {
    if (candidates.length === 0 || candidates[0].votes === candidate.votes) {
      candidates.push(candidate);
    } else if (candidates[0].votes < candidate.votes) {
      candidates = [candidate];
    }
  }
  if (candidates.length === 1) {
    return [];
  }

  return candidates.map((value) => value.name);
}

async function mergeDBs(dbFiles: string[]) {
  // Defines a mapping from IDs to resources
  const uniqueResources: { [id: string]: NonImageResource } = {};

  // First open every DB and store its resources as an array in dbResources
  const dbresources = (await Promise.all(dbFiles.map((file) => {
    const importDB = new Datastore({
      filename: file + ".db",
      autoload: true
    });
    return dbfind(importDB, {}) as Promise<NonImageResource[]>;
  }))) as NonImageResource[][];

  // Loop through DBs
  dbresources.map((dbresource) => {
    // Loop through resources for a DB
    dbresource.map((resource) => {
      /* For each resource, determine whether it already exists in the
        mapping, and then increment votes if it is a candidate resource.
        If resource doesn't exist in the mapping, then just initalize it
        in the mapping. */
      if (resource.id in uniqueResources) {
        if (resource.type === "candidate") {
          (uniqueResources[resource.id] as Candidate)
            .votes += (resource as Candidate).votes;
        }
      } else {
        uniqueResources[resource.id] = resource;
      }
    });
  });

  // Collect unique resources in an array
  return Object.keys(uniqueResources)
    .map((resourceID) => uniqueResources[resourceID]);
}

class MergeDatastore {
  private db: Datastore;
  constructor() {
    this.db = new Datastore({
      filename: config.database.mergeDB,
      autoload: true,
      timestampData: true
    });
  }

  public async getMerges() {
    return await dbfind(this.db, {});
  }

  public async deleteMerge(id: string) {
    return await dbRemove(this.db, { id });
  }
  public async newMerge(dbFiles: string[]) {
    const mergedResources = await mergeDBs(dbFiles);

    const ties: Tie[] = [];
    const polls: PollTotal[] = [];
    console.log(mergedResources);
    mergedResources.map((resource) => {
      if (resource.type === "poll") {
        const pollCandidates: Candidate[] = [];

        // Now calculate total votes for this poll
        let totalVotes = 0;
        mergedResources.map((value) => {
          if (value.type === "candidate") {
            if ((value as Candidate).parentID === resource.id) {
              totalVotes += (value as Candidate).votes;
              pollCandidates.push(value as Candidate);
            }
          }
        });

        // Calculate and push ties for this poll
        const tie = checkforTies(pollCandidates);
        if (tie.length > 0) {
          ties.push({
            pollName: resource.name,
            candidates: tie
          });
        }

        polls.push({
          name: resource.name,
          votes: totalVotes
        });
      }
    });

    const merge: Merge = {
      id: generate(),
      merged: mergedResources,
      ties: ties,
      polls: polls
    };

    await dbInsert(this.db, merge);
  }
}

export const db = new MergeDatastore();
