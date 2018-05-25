type ResponseHandler = (res: any) => void;

export function multipartSubmitter(
  form: JQuery<HTMLFormElement>,
  successCB: ResponseHandler,
  errorCB: ResponseHandler): void {

  form.submit((e: JQuery.Event<HTMLFormElement, null>) => {
    const resourceForm = $(e.target);
    const data = new FormData(e.target);

    $.ajax({
      url: resourceForm.attr("action"),
      method: resourceForm.attr("data-method"),
      data: data,
      cache: false,
      processData: false,
      contentType: false,
      success: successCB,
      error: errorCB
    });

    e.preventDefault();
  });
}

export function imageLoader(
  fileInput: JQuery<HTMLInputElement>,
  image: JQuery<HTMLImageElement>): void {

  fileInput.change(
    (e: JQuery.Event<HTMLInputElement, null>) => {
      const imageInput = e.target;
      const reader = new FileReader();

      reader.onload = (readEvent) => {
        image.attr("src", readEvent.target.result);
      };

      if (imageInput.files && imageInput.files[0]) {
        if (imageInput.files.length === 1) {
          reader.readAsDataURL(imageInput.files[0]);
        } else {
          image.attr("src", "#");
          image.attr("alt", "Too many images.");
        }
      }
    }
  );
}
