(() => {
  const root = document.querySelector(".lp-home");
  if (!root) return;

  const calendar = root.querySelector(".github-calendar");
  if (calendar) {
    window.addEventListener(
      "load",
      () => {
        calendar.scrollLeft = calendar.scrollWidth;
      },
      { once: true },
    );
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let canonGlitchFrame = 0;
  let canonGlitchTimer;

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
        window.cancelAnimationFrame(canonGlitchFrame);
        window.clearTimeout(canonGlitchTimer);
        root.classList.remove("is-canon-glitching");
        canonGlitchFrame = window.requestAnimationFrame(() => {
          canonGlitchFrame = window.requestAnimationFrame(() => {
            root.classList.add("is-canon-glitching");
            canonGlitchTimer = window.setTimeout(
              () => root.classList.remove("is-canon-glitching"),
              480,
            );
          });
        });
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

  const scrambleChars = "01!<>/[]{}*+";
  root.querySelectorAll("[data-scramble]").forEach((element) => {
    const text = element.dataset.scramble;
    if (element.closest(".lp-nav-links")) {
      element.setAttribute("aria-label", text);
      let frame = 0;

      const scramble = () => {
        if (reduceMotion) return;
        window.cancelAnimationFrame(frame);
        const start = performance.now();
        const animate = (now) => {
          const progress = Math.min((now - start) / 450, 1);
          const revealed = Math.floor(progress * text.length);
          element.textContent = Array.from(text, (character, index) => {
            if (character === " " || index < revealed) return character;
            return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          }).join("");

          if (progress < 1) {
            frame = window.requestAnimationFrame(animate);
          } else {
            element.textContent = text;
            frame = 0;
          }
        };
        frame = window.requestAnimationFrame(animate);
      };

      element.addEventListener("mouseenter", scramble);
      element.addEventListener("focus", scramble);
      return;
    }

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
      const scrollLeft = viewport.scrollLeft;
      const maxScroll = viewport.scrollWidth - viewport.clientWidth - 1;
      controls.forEach((button) => {
        const direction = Number(button.dataset.sliderStep);
        const disabled = direction < 0
          ? scrollLeft <= 1
          : scrollLeft >= maxScroll;
        if (button.disabled !== disabled) button.disabled = disabled;
      });
    };

    let controlsUpdatePending = false;
    const scheduleControlsUpdate = () => {
      if (controlsUpdatePending) return;
      controlsUpdatePending = true;
      window.requestAnimationFrame(() => {
        controlsUpdatePending = false;
        updateControls();
      });
    };

    controls.forEach((button) => {
      button.addEventListener("click", () => {
        const direction = Number(button.dataset.sliderStep);
        viewport.scrollBy({
          left: direction * viewport.clientWidth * 0.82,
          behavior: reduceMotion ? "auto" : "smooth",
        });
      });
    });

    viewport.addEventListener("scroll", scheduleControlsUpdate, { passive: true });
    window.addEventListener("resize", scheduleControlsUpdate);
    scheduleControlsUpdate();
  }
})();
