import { db, dbInsert } from "../server/model/elections";

export async function createDummyData() {
    let id = 1;
    for (let i = 0; i < 3; i++) {
        const electionID = (id++).toString();
        await dbInsert(db.db, {
            type: "election",
            id: electionID,
            name: "Superhero Awards 2018",
            caption: "Save the WORLD!",
            image: "/images/a.png",
            color: "#6d0b0b"
        });
        for (let j = 0; j < 3; j++) {
            const pollID = (id++).toString();
            await dbInsert(db.db, {
                type: "poll",
                id: pollID,
                name: "Best Cape",
                caption: "Defeat villains with LOOKS.",
                image: "/images/b.png",
                color: "#000000",
                parentID: electionID
            });
            for (let k = 0; k < 3; k++) {
                await dbInsert(db.db, {
                    type: "candidate",
                    id: (id++).toString(),
                    name: "Superman",
                    image: "/images/c.png",
                    parentID: pollID
                });

            }

        }

    }
}
