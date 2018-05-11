/**
 * Handles page navigation for loading views dynamically in the app.
 */

$(() => {
  const navlinks = $(".nav-link") as JQuery<HTMLAnchorElement>;
  const mainContent = $("main") as JQuery<HTMLMainElement>;

  // Load the page navigated to initally on the URL bar
  const currentPath: string = window.location.pathname;
  loadPage(mainContent, currentPath);

  // Set current navlink as "active" on display
  let currentNavlink = $(`a[href=\"${currentPath}\"]`);
  currentNavlink.addClass("active");

  // When users press back button on browser, load previous page
  $(window).on("popstate", () => {
    loadPage(mainContent, window.location.pathname);
  });

  // Event handlers for navigation links onclick
  navlinks.click((e) => {
    const nextNavlink = $(e.currentTarget);
    const link = nextNavlink.attr("href");
    if (link === "/users/logout") {
      window.location.href = link;
      return;
    }
    // Push link in browser history
    window.history.pushState("", "", link);

    // Set only current navlink as "active" on display
    currentNavlink.removeClass("active");
    nextNavlink.addClass("active");
    currentNavlink = nextNavlink;

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
  if (pagePath === "/" || pagePath === "") {
    pagePath = "/elections";
  }
  mainContent.hide("fast", () => {
    mainContent.load("/pages" + pagePath, () => {
      mainContent.show("fast");
    });
  });
}
