$(() => {
  const carousel = $("results-carousel") as JQuery<HTMLElement> & {
    carousel(arg: string | number ): void;
  };

  $(document).keydown((keydown) => {
    if (keydown.key === "32") {
      carousel.carousel("pause");
    }
  });
/*
  $("#playButton").click(() => {
    carousel.carousel("cycle");
  });

  $("#pauseButton").click(() => {
    carousel.carousel("pause");
  })*/
});
