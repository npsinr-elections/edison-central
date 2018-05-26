export function deleteResourceOnClick(element: JQuery<HTMLElement>) {
    element.click((e: JQuery.Event<HTMLElement, null>) => {
        const button = $(e.currentTarget);
        const confirmMessage = "Are you sure you want to remove "
                                + button.attr("data-name")
                                + "?";
        if (window.confirm(confirmMessage)) {
        $.ajax({
          url: button.attr("data-action"),
          method: "DELETE",
          success: (_RES) => {
            const redirect = button.attr("data-redirect");
            switch (redirect) {
              case "reload":
                window.location.reload();
                break;
              case "back":
                window.history.back();
                break;
              case "none":
                const resourceContainer = button
                .closest(".resource-container");
                resourceContainer.hide("fast", () => {
                  resourceContainer.remove();
                });
                break;
              default:
                window.location.href = redirect;
            }
          }
        });
      }
      });
}
