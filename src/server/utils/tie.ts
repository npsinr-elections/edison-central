let json={
    "polls":[{
        "name":"Challengers Vice Captain",
        "foreColor":"#FFF",
        "backColor":"#F00",
        "candidates":[
            {
                "name":"Superman",
                "votes":100,
                "imageURL":"path/to/picture.jpg"
            }
        ]
    }
]
}
checkVotes("Challengers Vice Captain");
function checkVotes(office: string) {
  let check = 0;
  for (const i of json.polls) {
    if (i.name === office) {
      let MAXVOTES = i.candidates[0].votes;
      for (const j of i.candidates) {
        if (j.votes > MAXVOTES) {
          MAXVOTES = j.votes;
          }}
      for (const k of i.candidates) {
        if (k.votes === MAXVOTES) {
          check += 1;
            }
        }
      if (check < 1) {
        check = 1;//placeholder
      }
      }
    }
  }
