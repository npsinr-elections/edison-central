import { config } from "../../config";
import { Candidate, Election, Poll } from "../../shared/models";
import { NonImageResource } from "../model/elections";
import { dbfind, dbInsert, dbRemove } from "../utils/database";
import { extractZipFile } from "../utils/zipAndUnzip";

import { unlink } from "fs";
import Datastore = require("nedb");
import { join } from "path";
import { generate } from "shortid";
import { promisify } from "util";

export interface Merge {
  id: string;
  merged: Election;
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

export function getWinners(pollCandidates: Candidate[]): Candidate[] {
  let candidates: Candidate[] = [];
  for (const candidate of pollCandidates) {
    if (candidates.length === 0 || candidates[0].votes === candidate.votes) {
      candidates.push(candidate);
    } else if (candidates[0].votes < candidate.votes) {
      candidates = [candidate];
    }
  }

  return candidates;
}

export async function uploadMerge(files: string[]) {
  const extractFilePromises: Array<Promise<void>> = [];
  const resultPaths: string[] = [];

  // req.files is declared a union type
  // but upload.array() gives an array
  for (const file of files) {
    const destPath = join(
      config.database.mergeTemp,
      generate()
    );

    extractFilePromises.push(
      extractZipFile(file, destPath)
    );

    resultPaths.push(destPath);
  }
  await Promise.all(extractFilePromises);
  await db.newMerge(resultPaths);

  const delFilesPromise = Promise.all([
    (files).map(
      (value) => {
        return promisify(unlink)(value);
      }
    )
  ]);

  await delFilesPromise;
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

  public async getMerges(): Promise<Merge[]> {
    return await dbfind(this.db, {});
  }

  public async getMergeByID(mergeID: string): Promise<Merge> {
    const merge = (await dbfind(this.db, { id: mergeID })) as Merge[];
    if (merge.length > 0) {
      return merge[0];
    } else {
      return undefined;
    }
  }

  public async deleteMerge(id: string) {
    return await dbRemove(this.db, { id });
  }
  public async newMerge(dbFiles: string[]) {
    const mergedResources = await mergeDBs(dbFiles);

    const ties: Tie[] = [];
    const votesCount: PollTotal[] = [];
    const polls: Poll[] = [];

    let mergedElection: Election;
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
        const winners = getWinners(pollCandidates);
        if (winners.length > 1) {
          ties.push({
            pollName: resource.name,
            candidates: winners.map((value) => value.name)
          });
        }

        // Push votes count for this poll
        votesCount.push({
          name: resource.name,
          votes: totalVotes
        });

        // Finally store the poll too in the poll list
        (resource as Poll).candidates = pollCandidates;
        (resource as Poll).winners = winners;
        polls.push(resource as Poll);
      } else if (resource.type === "election") {
        mergedElection = resource as Election;
      }
    });

    mergedElection.polls = polls;

    const merge: Merge = {
      id: generate(),
      merged: mergedElection,
      ties: ties,
      polls: votesCount
    };

    await dbInsert(this.db, merge);
  }
}

export const db = new MergeDatastore();
