(() => {
  const root = document.querySelector(".lp-home");
  if (!root) return;

  const contributionCalendar = root.querySelector(".github-calendar");
  if (
    contributionCalendar &&
    contributionCalendar.scrollWidth > contributionCalendar.clientWidth
  ) {
    contributionCalendar.scrollLeft = contributionCalendar.scrollWidth;
  }

  const plugins = [
    window.ScrollTrigger,
    window.SplitText,
    window.TextPlugin,
    window.Draggable,
    window.InertiaPlugin,
    window.Observer,
    window.ScrambleTextPlugin,
    window.ScrollToPlugin,
  ];

  if (!window.gsap || plugins.some((plugin) => !plugin)) {
    console.error("[Lore Playing] GSAP or a required plugin failed to load; homepage motion is disabled.");
    return;
  }

  const {
    gsap,
    ScrollTrigger,
    SplitText,
    TextPlugin,
    Draggable,
    InertiaPlugin,
    Observer,
    ScrambleTextPlugin,
    ScrollToPlugin,
  } = window;
  gsap.registerPlugin(
    ScrollTrigger,
    SplitText,
    TextPlugin,
    Draggable,
    InertiaPlugin,
    Observer,
    ScrambleTextPlugin,
    ScrollToPlugin,
  );

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = reduceMotion ? 0 : 0.45;

  if (!reduceMotion) {
    root.querySelectorAll(".lp-title, .lp-section-title").forEach((element) => {
      SplitText.create(element, {
        type: "chars",
        charsClass: "lp-char",
        mask: "chars",
        autoSplit: true,
        deepSlice: true,
        onSplit(split) {
          return gsap.from(split.chars, {
            yPercent: 115,
            autoAlpha: 0,
            duration: 0.75,
            stagger: 0.018,
            ease: "power4.out",
            scrollTrigger: {
              trigger: element,
              start: "top 84%",
              once: true,
            },
          });
        },
      });
    });

    gsap.to(".lp-ascii-stage", {
      yPercent: 12,
      rotation: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".lp-field",
        start: "top top",
        end: "bottom top",
        scrub: 0.8,
      },
    });

    gsap.from(".lp-case", {
      y: 55,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.75,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".lp-slider-window",
        start: "top 82%",
        once: true,
      },
    });

    gsap.fromTo(
      ".lp-contribution-frame .github-contribution-day:not(.future)",
      { scale: 0.2, rotation: 30 },
      {
        scale: 1,
        rotation: 0,
        duration: 0.28,
        stagger: { each: 0.001, from: "random" },
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ".lp-contribution-frame",
          start: "top 82%",
          once: true,
        },
      },
    );

    gsap.from("[data-hero-intro]", {
      y: 18,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.6,
      ease: "power2.out",
      delay: 0.12,
    });
  }

  const readout = root.querySelector("[data-live-readout]");
  let resetReadout;
  if (readout) {
    resetReadout = gsap.delayedCall(0.8, () => {
      gsap.to(readout, {
        duration,
        text: { value: "INPUT: IDLE", delimiter: "" },
        ease: "none",
      });
    }).pause();

    Observer.create({
      target: window,
      type: "wheel,touch",
      tolerance: 12,
      onUp() {
        gsap.killTweensOf(readout);
        gsap.to(readout, {
          duration,
          text: { value: "INPUT: UP / REWRITE", delimiter: "" },
          ease: "none",
        });
      },
      onDown() {
        gsap.killTweensOf(readout);
        gsap.to(readout, {
          duration,
          text: { value: "INPUT: DOWN / DESCEND", delimiter: "" },
          ease: "none",
        });
      },
      onStop() {
        resetReadout.restart(true);
      },
    });
  }

  root.querySelectorAll("[data-scramble]").forEach((element) => {
    const scramble = () => {
      gsap.killTweensOf(element);
      gsap.to(element, {
        duration,
        scrambleText: {
          text: element.dataset.scramble,
          chars: "01!<>/[]{}*+",
          speed: 0.45,
        },
        ease: "none",
      });
    };

    element.addEventListener("mouseenter", scramble);
    element.addEventListener("focus", scramble);
  });

  const canonSwitch = root.querySelector("[data-canon-switch]");
  const canonState = root.querySelector("[data-canon-state]");
  const canonAction = root.querySelector("[data-canon-action]");
  const canonSymbol = root.querySelector("[data-canon-symbol]");
  const canonSubtitle = root.querySelector("[data-canon-subtitle]");
  const canonDescription = root.querySelector("[data-canon-description]");
  if (
    canonSwitch &&
    canonState &&
    canonAction &&
    canonSymbol &&
    canonSubtitle &&
    canonDescription
  ) {
    let canonGlitchTimer;
    canonSwitch.addEventListener("click", () => {
      const rewritten = canonSwitch.getAttribute("aria-pressed") !== "true";
      canonSwitch.setAttribute("aria-pressed", String(rewritten));
      const updates = [
        [
          canonState,
          rewritten ? "CANON: PLAYER-ALTERED" : "CANON: UNTOUCHED",
        ],
        [
          canonAction,
          rewritten ? "RESTORE THE ORIGINAL" : "REWRITE THE CANON",
        ],
        [
          canonSymbol,
          rewritten ? "[↺]" : "[+]",
        ],
        [
          canonSubtitle,
          rewritten ? "story rewritten by you" : "canonical stories",
        ],
        [
          canonDescription,
          rewritten
            ? "Canon shifted. Try a new path through the story, make different choices, and shape an ending that belongs to you."
            : "The classics are only the first draft. Step into the story, take a role, and find out what happens when you get a say.",
        ],
      ];

      updates.forEach(([element]) => {
        gsap.killTweensOf(element);
      });

      if (!reduceMotion) {
        window.clearTimeout(canonGlitchTimer);
        root.classList.remove("is-canon-glitching");
        void root.offsetWidth;
        root.classList.add("is-canon-glitching");
        canonGlitchTimer = window.setTimeout(() => {
          root.classList.remove("is-canon-glitching");
        }, 480);
      }

      updates.forEach(([element, value]) => {
        gsap.to(element, {
          duration,
          text: { value, delimiter: "" },
          ease: "none",
        });
      });
    });
  }

  root.querySelectorAll('a[href^="#lp-"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      if (reduceMotion) return;

      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      gsap.to(window, {
        duration: 0.8,
        scrollTo: { y: top, autoKill: true },
        ease: "power3.inOut",
      });
    });
  });

  const viewport = root.querySelector("[data-slider-window]");
  const track = root.querySelector("[data-slider-track]");
  if (viewport && track) {
    const controls = [...root.querySelectorAll("[data-slider-step]")];
    const draggable = Draggable.create(track, {
      type: "x",
      bounds: viewport,
      edgeResistance: 0.82,
      inertia: !reduceMotion,
      allowNativeTouchScrolling: true,
      onDragStart() {
        viewport.classList.add("is-dragging");
      },
      onDragEnd() {
        viewport.classList.remove("is-dragging");
      },
      onThrowComplete() {
        updateControls();
      },
      onDrag() {
        updateControls();
      },
    })[0];

    viewport.classList.add("is-enhanced");
    controls.forEach((button) => {
      button.disabled = false;
      button.addEventListener("click", () => {
        const bounds = draggable;
        const currentX = Number(gsap.getProperty(track, "x")) || 0;
        const direction = Number(button.dataset.sliderStep);
        const nextX = gsap.utils.clamp(
          bounds.minX,
          bounds.maxX,
          currentX - direction * viewport.clientWidth * 0.82,
        );
        gsap.to(track, {
          x: nextX,
          duration,
          ease: "power3.out",
          onUpdate: () => draggable.update(),
          onComplete: updateControls,
        });
      });
    });

    function updateControls() {
      const x = Number(gsap.getProperty(track, "x")) || 0;
      controls.forEach((button) => {
        const direction = Number(button.dataset.sliderStep);
        button.disabled = direction < 0 ? x >= draggable.maxX - 1 : x <= draggable.minX + 1;
      });
    }

    updateControls();
    window.addEventListener("resize", () => draggable.applyBounds());
  }
})();
