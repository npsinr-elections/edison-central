$(() => {
  const exportPollsBtn = $("#poll-select-form");
  console.log(exportPollsBtn);
  exportPollsBtn.submit((event) => {
    const checkedBoxes = $("input[type=checkbox]:checked").length;
    console.log(checkedBoxes);
    if (checkedBoxes === 0) {
      alert("No poll selected. Please select at least one poll.");
      event.preventDefault();
    }
  });
});
