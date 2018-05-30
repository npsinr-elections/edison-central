$(() => {
  const carousel = $("#results-carousel") as JQuery<HTMLElement> & {
    carousel(arg: string | number): void;
  };

  let paused = false;

  $(document).keydown((keydown) => {
    if (keydown.which === 32) {
      carousel.carousel(paused ? "cycle" : "pause");
      paused = !paused;
    }
  });

  const candidateBlock = $(".candidates-block");

  candidateBlock.each((_BLOCK_INDEX, blockElem) => {
    const block = $(blockElem);

    const cards = block.find(".candidate-card");
    if (cards.length === 4) {
      block.addClass("four-cards");
    }
  });

  function isCandidateSlide(to: number): boolean {
    return to % 2 === 1;
  }

  carousel.on("slid.bs.carousel",
    (slide: JQuery.Event<HTMLElement, null> & { from: number, to: number }) => {
      if (isCandidateSlide(slide.to)) {
        const pollID = (slide.to - 1) / 2;
        const block = $(`#block-${pollID}`);

        const cards = block.find(".candidate-card");
        const winners = block.find(".winner");
        const crowns = winners.find(".crown");
        const notWinners = block.find(".not-winner");

        cards.each((index, cardElem) => {
          const card = $(cardElem);

          const votes = { votes: 0 };
          const numVotes = Number(card.attr("data-votes"));

          const voteSpan = $(`#votes-${pollID}-${index}`);

          $(votes).animate({ votes: numVotes }, {
            duration: 2000,
            easing: "swing",
            step: () => {
              voteSpan.text(Math.min(Math.ceil(votes.votes), numVotes));
            }
          });
        });

        window.setTimeout(() => {
          winners.addClass("candidate-active");
          notWinners.addClass("candidate-inactive");
          crowns.fadeIn("slow");
        }, 2500);
      }

      if (isCandidateSlide(slide.from)) {
        const block = $(`#block-${(slide.from - 1) / 2}`);

        const winners = block.find(".winner");
        const notWinners = block.find(".not-winner");
        const crowns = winners.find(".crown");

        winners.removeClass("candidate-active");
        notWinners.removeClass("candidate-inactive");
        crowns.fadeOut("fast");
      }
    }
  );
});
