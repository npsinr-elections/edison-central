import { config } from "../../config";
import { Candidate, Poll } from "../model/elections";
import { NonImageResource } from "../model/elections";
import { dbfind, dbInsert } from "./database";

import Datastore = require("nedb");
import { join } from "path";
import { generate } from "shortid";

export interface Tie {
  pollName: string;
  candidates: string[];
}

export function checkforTies(poll: Poll): string[] {
  let candidates: Candidate[] = [];
  let ties: string[] = [];
  for (const candidate of poll.candidates) {
    if (candidates.length === 0 || candidates[0].votes === candidate.votes) {
      candidates.push(candidate);
      ties.push(candidate.name);
    } else if (candidates[0].votes < candidate.votes) {
      candidates = [candidate];
      ties = [candidate.name];
    }

    if (candidates.length === 1) {
      return [];
    }

    return ties;
  }
}

export async function mergeDBs(dbFiles: string[]) {
  // Defines a mapping from IDs to resources
  const uniqueResources: { [id: string]: NonImageResource } = {};

  // First open every DB and store its resources as an array in dbResources
  const dbresources = (await Promise.all(dbFiles.map((file) => {
    const db = new Datastore({
      filename: file + ".db",
      autoload: true
    });
    return dbfind(db, {}) as Promise<NonImageResource[]>;
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
  const mergedResources = Object.keys(uniqueResources)
    .map((resourceID) => uniqueResources[resourceID]);

  // Write merged resources to a new database file
  const mergedDBName = join(config.database.merges, `merge_${generate()}.db`);
  const mergedDB = new Datastore({
    filename: mergedDBName,
    autoload: true
  });

  await dbInsert(mergedDB, mergedResources);
  return mergedDBName;
}
