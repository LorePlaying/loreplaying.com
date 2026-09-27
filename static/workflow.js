document.addEventListener("DOMContentLoaded", () => {
  const diagrams = document.querySelectorAll(".lp-workflow-diagram");

  if (!diagrams.length) {
    return;
  }

  /*
   * Reveal each workflow when it enters the viewport.
   * This keeps the page calm while still giving the
   * diagrams a little life when they appear.
   */

  if (!("IntersectionObserver" in window)) {
    diagrams.forEach((diagram) => {
      diagram.classList.add("is-visible");
    });

    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -60px 0px",
    }
  );

  diagrams.forEach((diagram) => {
    observer.observe(diagram);
  });
});