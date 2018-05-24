import { imageLoader, multipartSubmitter } from "./modules/form";

$(() => {
  /**
   * Change the image when an image is uploaded
   */
  const imageInput = $("#candidate-image-input") as JQuery<HTMLInputElement>;
  const imagePreview =
    $("#candidate-uploaded-image") as JQuery<HTMLImageElement>;
  imageLoader(imageInput, imagePreview);

  /**
   * Submit the form data to the server
   */
  const candidateForm = $("#candidate-form") as JQuery<HTMLFormElement>;
  multipartSubmitter(
    candidateForm,
    (res) => { console.log($.parseJSON(res.responseText)); },
    (res) => { console.error($.parseJSON(res.responseText)); }
  );
});
