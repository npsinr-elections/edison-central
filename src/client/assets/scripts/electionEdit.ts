$(() => {
  /**
   * Submit the form data to the server
   */
  $("#election-form").submit((e: JQuery.Event<HTMLFormElement, null>) => {
    const electionForm = $(e.target);
    const data = new FormData(e.target);

    $.ajax({
      method: "PUT",
      data: data,
      cache: false,
      processData: false,
      contentType: "multipart/form-data",
      success: (res) => {
        console.log(res);
      },
      url: electionForm.attr("action")
    });

    e.preventDefault();
  });

  /**
   * Change the image when an image is uploaded
   */
  $("#election-image-input").change(
    (e: JQuery.Event<HTMLInputElement, null>) => {
      const imageInput = e.target;
      const imagePreview = $("#election-uploaded-image");
      const reader = new FileReader();

      reader.onload = (readEvent) => {
        imagePreview.attr("src", readEvent.target.result);
      };

      if (imageInput.files && imageInput.files[0]) {
        if (imageInput.files.length === 1) {
          reader.readAsDataURL(imageInput.files[0]);
        } else {
          imagePreview.attr("src", "#");
          imagePreview.attr("alt", "Too many images.");
        }
      }
    }
  );
});
