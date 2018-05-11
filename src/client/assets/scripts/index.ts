/**
 * Handles page navigation for loading views dynamically in the app.
 * @module client/assets/scripts/index
 */

$(() => {
  // Page initially on the URL bar
  let currentPath: string = window.location.pathname;

  const navlinks = $(".nav-link") as JQuery<HTMLAnchorElement>;
  const mainContent = $("main") as JQuery<HTMLMainElement>;
  const currentNavlink =
    $(`a[href="${currentPath}"]`) as JQuery<HTMLAnchorElement>;

  // Load the page navigated to initially on the URL bar
  if (currentPath === "/") {
    currentPath = "/elections";
  }
  loadPage(mainContent, currentPath);
  currentNavlink.addClass("active");

  // When users press the back button on browser, load previous page
  $(window).on("popstate", () => {
    loadPage(mainContent, window.location.pathname);
  });

  // Event handlers for navigation links onclick
  navlinks.click((e) => {
    const link = $(e.currentTarget).attr("href");
    if (link === "/users/logout") {
      window.location.href = link;
      return;
    }
    // Push link into browser history
    window.history.pushState("", "", link);

    // Set only current navlink as "active" on display
    currentNavlink.removeClass("active");
    $(e.currentTarget).addClass("active");

    loadPage(mainContent, link);
    e.preventDefault();
  });
});

/**
 * Loads a page from `pagePath` into `mainContent`
 * @param  {JQuery<HTMLMainElement>} mainContent Container for page
 * @param  {string} pagePath path for requested page
 */
function loadPage(mainContent: JQuery<HTMLMainElement>, pagePath: string) {
  mainContent.hide("fast", () => {
    mainContent.load("/pages" + pagePath, () => {
      mainContent.show("fast");
    });
  });
}
