import Datastore = require("nedb");
import { config } from "../../config";

function dbfind(db: Datastore, query: any): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.find(query, (err: any, docs: any[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });
}

class ElectionsDatastore {
  private db: Datastore;
  constructor() {
    this.db = new Datastore({
      filename: config.database.elections,
      autoload: true
    });
  }

  public async getElections() {
    const elections = await dbfind(this.db, { type: "election" });
    for (const election of elections) {
      election.polls = await (this.getPolls(election.id));
    }
  }

  private async getPolls(electionID: string) {
    const polls = await dbfind(this.db, { type: "poll", parentID: electionID });
    for (const poll of polls) {
      poll.candidates = await this.getCandidates(poll.id);
    }
  }

  private async getCandidates(pollID: string) {
    return await dbfind(this.db, { type: "candidate", parentID: pollID });
  }
}

export const db = new ElectionsDatastore();
