import { Candidate, Poll } from "../model/elections";

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
