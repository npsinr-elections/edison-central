export function deleteResourceOnClick(element: JQuery<HTMLElement>) {
    element.click((e: JQuery.Event<HTMLElement, null>) => {
        $.ajax({
          url: $(e.target).attr("data-action"),
          method: "DELETE",
          success: (_RES) => {
            const redirectURL = $(e.target).attr("data-redirect");
            if (redirectURL === undefined) {
              window.history.back();
            } else {
              window.location.href = redirectURL;
            }
          }
        });
      });
}
