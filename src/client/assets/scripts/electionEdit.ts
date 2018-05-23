$(() => {
  const electionForm = $("#election-form") as JQuery<HTMLFormElement>;

  electionForm.submit((e: JQuery.Event<HTMLFormElement, null>) => {
    console.log(electionForm.serialize());
    $.ajax({
      type: "PUT",
      data: electionForm.serialize(),
      success: (res) => {
        console.log(res);
      },
      url: electionForm.attr("action")
    });

    e.preventDefault();
  });
});
