export function deleteResourceOnClick(element: JQuery<HTMLElement>) {
    element.click((e: JQuery.Event<HTMLElement, null>) => {
        $.ajax({
          url: $(e.target).attr("data-action"),
          method: "DELETE",
          success: (_RES) => {
            const redirect = $(e.target).attr("data-redirect");
            switch (redirect) {
              case "reload":
                window.location.reload(true);
                break;
              case "back":
                window.history.back();
                break;
              default:
                window.location.href = redirect;
            }
          }
        });
      });
}
