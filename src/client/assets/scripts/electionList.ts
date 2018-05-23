$(() => {
  $(".btn-del-election").click((e: JQuery.Event<HTMLElement, null>) => {
    const electionID = $(e.target).attr("data-election-id");
    $.ajax({
      url: `/elections/${electionID}`,
      method: "DELETE",
      success: (_RES) => {
        console.log(electionID, "deleted");
      }
    });
  });
});
