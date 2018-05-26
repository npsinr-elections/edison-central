import { db } from "../server/model/elections";
import { dbInsert } from "../server/utils/database";

export async function createDummyData() {
  let id = 1;
  for (let i = 0; i < 3; i++) {
    const electionID = (id++).toString();
    await dbInsert(db.db, {
      type: "election",
      id: electionID,
      name: "Superhero Awards 2018",
      caption: "Save the WORLD!",
      image: "/assets/images/election-default.jpg",
      color: "#6d0b0b",
    });
    const fallback = (id + 8).toString();
    for (let j = 0; j < 3; j++) {
      const pollID = (id++).toString();
      await dbInsert(db.db, {
        type: "poll",
        id: pollID,
        name: "Best Cape",
        caption: "Defeat villains with LOOKS.",
        color: "#000000",
        parentID: electionID,
        group: "house"
      });
      for (let k = 0; k < 3; k++) {
        await dbInsert(db.db, {
          type: "candidate",
          id: (id++).toString(),
          name: "Superman",
          image: "/assets/images/candidate-default.jpg",
          parentID: pollID,
          group: "heroes",
          fallback: (fallback === pollID) ? "_none_" : fallback
        });
      }
    }
  }
}
