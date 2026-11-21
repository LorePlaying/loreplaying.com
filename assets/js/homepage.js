(() => {
  const root = document.querySelector(".lp-home");
  if (!root) return;

  const calendar = root.querySelector(".github-calendar");
  if (calendar) {
    calendar.scrollLeft = calendar.scrollWidth;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const canonSwitch = root.querySelector("[data-canon-switch]");
  if (canonSwitch) {
    const canonState = root.querySelector("[data-canon-state]");
    const canonAction = root.querySelector("[data-canon-action]");
    const canonSymbol = root.querySelector("[data-canon-symbol]");
    const canonSubtitle = root.querySelector("[data-canon-subtitle]");
    const canonDescription = root.querySelector("[data-canon-description]");

    canonSwitch.addEventListener("click", () => {
      const rewritten = canonSwitch.getAttribute("aria-pressed") !== "true";
      canonSwitch.setAttribute("aria-pressed", String(rewritten));
      canonState.textContent = rewritten ? "CANON: PLAYER-ALTERED" : "CANON: UNTOUCHED";
      canonAction.textContent = rewritten ? "RESTORE THE ORIGINAL" : "REWRITE THE CANON";
      canonSymbol.textContent = rewritten ? "[↺]" : "[+]";
      canonSubtitle.textContent = rewritten ? "story rewritten by you" : "canonical stories";
      canonDescription.textContent = rewritten
        ? "Canon shifted. Try a new path through the story, make different choices, and shape an ending that belongs to you."
        : "The classics are only the first draft. Step into the story, take a role, and find out what happens when you get a say.";

      if (!reduceMotion) {
        root.classList.remove("is-canon-glitching");
        void root.offsetWidth;
        root.classList.add("is-canon-glitching");
        window.setTimeout(() => root.classList.remove("is-canon-glitching"), 480);
      }
    });
  }

  root.querySelectorAll('a[href^="#lp-"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  root.querySelectorAll("[data-scramble]").forEach((element) => {
    const text = element.dataset.scramble;
    element.addEventListener("mouseenter", () => {
      if (!reduceMotion) element.textContent = text;
    });
  });

  const readout = root.querySelector("[data-live-readout]");
  let readoutTimer;
  if (readout) {
    const resetReadout = () => {
      window.clearTimeout(readoutTimer);
      readoutTimer = window.setTimeout(() => {
        readout.textContent = "INPUT: IDLE";
      }, 800);
    };

    window.addEventListener("wheel", (event) => {
      readout.textContent = event.deltaY < 0 ? "INPUT: UP / REWRITE" : "INPUT: DOWN / DESCEND";
      resetReadout();
    }, { passive: true });
  }

  const viewport = root.querySelector("[data-slider-window]");
  const controls = [...root.querySelectorAll("[data-slider-step]")];
  if (viewport && controls.length) {
    viewport.classList.add("is-enhanced");

    const updateControls = () => {
      controls.forEach((button) => {
        const direction = Number(button.dataset.sliderStep);
        button.disabled = direction < 0
          ? viewport.scrollLeft <= 1
          : viewport.scrollLeft >= viewport.scrollWidth - viewport.clientWidth - 1;
      });
    };

    controls.forEach((button) => {
      button.disabled = false;
      button.addEventListener("click", () => {
        const direction = Number(button.dataset.sliderStep);
        viewport.scrollBy({
          left: direction * viewport.clientWidth * 0.82,
          behavior: reduceMotion ? "auto" : "smooth",
        });
      });
    });

    viewport.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);
    updateControls();
  }
})();
