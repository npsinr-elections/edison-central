import { deleteResourceOnClick } from "./modules/deleteResource";
import { imageLoader, multipartSubmitter } from "./modules/form";

$(() => {
  /**
   * Change the image when an image is uploaded
   */
  const imageInput = $("#poll-image-input") as JQuery<HTMLInputElement>;
  deleteResourceOnClick($(".btn-del-poll"));
  const imagePreview =
    $("#poll-uploaded-image") as JQuery<HTMLImageElement>;
  imageLoader(imageInput, imagePreview);

  /**
   * Submit the form data to the server
   */
  const pollForm = $("#poll-form") as JQuery<HTMLFormElement>;
  multipartSubmitter(pollForm);
});
