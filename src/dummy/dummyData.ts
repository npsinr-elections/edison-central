
import { Election, Poll } from "../shared/models";

function dummyPoll(numCandidates: number): Poll {
  const poll: Poll = {
    id: "2",
    type: "poll",
    name: "Prefect",
    caption: "Reach Out, Reach High, Reach Beyond.",
    color: "#404040",
    parentID: "1",
    candidates: []
  };

  function getCandidate(a: string) {
    const candidate = {
      id: "3",
      type: "candidate",
      name: "Superman Supradeesh Manojkumar " + a,
      image: "/assets/images/candidate-default.jpg",
      votes: 1000,
      parentID: "2",
      fallback: "2",
      fallbackName: "Prefect"
    };
    return candidate;
  }

  for (let i = 0; i < numCandidates; i += 1) {
    poll.candidates.push(getCandidate((i + 1).toString()));
  }

  return poll;
}

export const election: Election = {
  id: "1",
  type: "election",
  name: "NPS Elections",
  caption: "Choose Responsibly, Choose Responsibility.",
  image: "/assets/images/election-default.jpg",
  color: "black",
  polls: [
    dummyPoll(1),
    dummyPoll(2),
    dummyPoll(3),
    dummyPoll(4),
    dummyPoll(5)
  ]
};
