import { multipartSubmitter } from "./modules/form";

$(() => {
  const mergeForm = $(".merge-form") as JQuery<HTMLFormElement>;
  multipartSubmitter(mergeForm);

  const mergeFileInput = $("#merge-file-input") as JQuery<HTMLInputElement>;
  const filesListHeader = $("#merge-files-list-header");
  const filesList = $("#merge-files-list");

  mergeFileInput.change((e: JQuery.Event<HTMLInputElement, null>) => {
    const files = e.currentTarget.files;

    filesListHeader.show();

    filesList.empty();
    filesList.append(
      // Use [].map.call to simulate files.map
      // because FileList does not have a .map property
      [].map.call(
        files,
        (file: File) => `<li>${file.name}</li>`
      ).join("\n")
    );
  });

  const resetButton = $("#merge-reset-button");

  resetButton.click(() => {
    filesList.empty();
    filesListHeader.empty();
  });
});
