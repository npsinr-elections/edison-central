import { imageLoader, multipartSubmitter } from "./modules/form";

$(() => {
  /**
   * Change the image when an image is uploaded
   */
  const imageInput = $("#election-image-input") as JQuery<HTMLInputElement>;
  const imagePreview =
    $("#election-uploaded-image") as JQuery<HTMLImageElement>;
  imageLoader(imageInput, imagePreview);

  /**
   * Submit the form data to the server
   */
  const electionForm = $("#election-form") as JQuery<HTMLFormElement>;
  multipartSubmitter(
    electionForm,
    (res) => { console.log($.parseJSON(res.responseText)); },
    (res) => { console.error($.parseJSON(res.responseText)); }
  );
});
