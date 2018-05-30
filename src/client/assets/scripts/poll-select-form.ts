$(() => {
  const exportPollsBtn = $("#poll-select-form");
  exportPollsBtn.submit((event) => {
    const checkedBoxes = $("input[type=checkbox]:checked").length;
    if (checkedBoxes === 0) {
      alert("No poll selected. Please select at least one poll.");
      event.preventDefault();
    }
  });
});
