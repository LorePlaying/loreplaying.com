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

  const contributionsGrid = root.querySelector(".github-contributions-grid");
  const contributionPopup = root.querySelector("#github-contribution-tooltip");
  if (contributionsGrid && contributionPopup) {
    const popupDate = contributionPopup.querySelector("[data-tooltip-date]");
    const popupCount = contributionPopup.querySelector("[data-tooltip-count]");
    const popupCommit = contributionPopup.querySelector("[data-tooltip-commit]");
    const popupPin = contributionPopup.querySelector("[data-tooltip-pin]");
    const popupHeader = contributionPopup.querySelector(
      ".github-contribution-tooltip-header",
    );
    let activeContribution = null;
    let popupPinned = false;
    let popupSelected = false;
    let popupMoved = false;
    let hidePopupTimer = 0;
    let popupDrag = null;

    const cancelHidePopup = () => {
      window.clearTimeout(hidePopupTimer);
      hidePopupTimer = 0;
    };

    const hideContributionPopup = () => {
      if (popupPinned || popupSelected) return;
      if (activeContribution) {
        activeContribution.setAttribute("aria-expanded", "false");
      }
      activeContribution = null;
      popupMoved = false;
      contributionPopup.classList.remove("is-visible");
      contributionPopup.setAttribute("aria-hidden", "true");
    };

    const scheduleHidePopup = () => {
      cancelHidePopup();
      hidePopupTimer = window.setTimeout(() => {
        hidePopupTimer = 0;
        const triggerHoveredOrFocused =
          activeContribution &&
          (activeContribution.matches(":hover") ||
            activeContribution === document.activeElement);
        const popupHoveredOrFocused =
          contributionPopup.matches(":hover") ||
          contributionPopup.contains(document.activeElement);
        if (popupPinned || triggerHoveredOrFocused || popupHoveredOrFocused) return;
        hideContributionPopup();
      }, 180);
    };

    const positionContributionPopup = () => {
      if (!contributionPopup.classList.contains("is-visible") || !activeContribution) return;
      const triggerRect = activeContribution.getBoundingClientRect();
      const frame = root.querySelector(".lp-contribution-frame");
      const frameRect = frame ? frame.getBoundingClientRect() : {
        left: 0,
        right: window.innerWidth,
        width: window.innerWidth,
      };
      const margin = 12;
      contributionPopup.style.maxWidth = `${Math.max(0, frameRect.width - margin * 2)}px`;
      const popupRect = contributionPopup.getBoundingClientRect();
      if (popupMoved) {
        const left = Number.parseFloat(contributionPopup.style.left);
        const top = Number.parseFloat(contributionPopup.style.top);
        const maxLeft = Math.max(margin, window.innerWidth - popupRect.width - margin);
        const maxTop = Math.max(margin, window.innerHeight - popupRect.height - margin);
        contributionPopup.style.left = `${Math.max(
          margin,
          Math.min(Number.isFinite(left) ? left : popupRect.left, maxLeft),
        )}px`;
        contributionPopup.style.top = `${Math.max(
          margin,
          Math.min(Number.isFinite(top) ? top : popupRect.top, maxTop),
        )}px`;
        return;
      }
      const minLeft = Math.max(margin, frameRect.left + margin);
      const maxLeft = Math.max(
        minLeft,
        Math.min(
          window.innerWidth - popupRect.width - margin,
          frameRect.right - popupRect.width - margin,
        ),
      );
      const left = Math.max(
        minLeft,
        Math.min(
          maxLeft,
          triggerRect.left + triggerRect.width / 2 - popupRect.width / 2,
        ),
      );
      const above = triggerRect.top - popupRect.height - margin;
      const below = triggerRect.bottom + margin;
      const top = above >= margin
        ? above
        : Math.min(below, window.innerHeight - popupRect.height - margin);
      contributionPopup.style.left = `${left}px`;
      contributionPopup.style.top = `${Math.max(margin, top)}px`;
    };

    const showContributionPopup = (trigger, fromClick = false) => {
      if (popupPinned && activeContribution !== trigger) return;
      if (popupSelected && activeContribution !== trigger && !fromClick) return;
      const count = Number(trigger.dataset.contributionCount);
      if (count < 1) {
        hideContributionPopup();
        return;
      }

      cancelHidePopup();
      if (activeContribution !== trigger) {
        if (activeContribution) {
          activeContribution.setAttribute("aria-expanded", "false");
        }
        popupMoved = false;
        activeContribution = trigger;
      }
      trigger.setAttribute("aria-expanded", "true");
      popupDate.textContent = trigger.dataset.contributionDate;
      popupCount.textContent = `${count} contribution${count === 1 ? "" : "s"}`;
      const contributionMessages = JSON.parse(
        trigger.dataset.contributionMessages || "[]",
      );
      popupCommit.replaceChildren();
      contributionMessages.forEach((commit) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href =
          `https://github.com/LorePlaying/loreplaying.com/commit/${encodeURIComponent(commit.sha)}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = commit.message;
        item.append(link);
        popupCommit.append(item);
      });
      popupCommit.hidden = contributionMessages.length === 0;
      if (fromClick) popupSelected = true;
      contributionPopup.classList.add("is-visible");
      contributionPopup.setAttribute("aria-hidden", "false");
      positionContributionPopup();
    };

    const findContribution = (target) => {
      if (!(target instanceof Element)) return null;
      const trigger = target.closest("[data-contribution-trigger]");
      return trigger && contributionsGrid.contains(trigger) ? trigger : null;
    };

    contributionsGrid.addEventListener("pointerover", (event) => {
      const trigger = findContribution(event.target);
      if (trigger) showContributionPopup(trigger);
    });
    contributionsGrid.addEventListener("pointerout", (event) => {
      const trigger = findContribution(event.target);
      if (
        trigger &&
        !trigger.contains(event.relatedTarget) &&
        !contributionPopup.contains(event.relatedTarget)
      ) {
        scheduleHidePopup();
      }
    });
    contributionsGrid.addEventListener("focusin", (event) => {
      const trigger = findContribution(event.target);
      if (trigger) showContributionPopup(trigger);
    });
    contributionsGrid.addEventListener("focusout", (event) => {
      const trigger = findContribution(event.target);
      if (trigger && !contributionPopup.contains(event.relatedTarget)) {
        scheduleHidePopup();
      }
    });
    contributionsGrid.addEventListener("click", (event) => {
      const trigger = findContribution(event.target);
      if (!trigger) {
        if (popupSelected && !popupPinned) {
          popupSelected = false;
          hideContributionPopup();
        }
        return;
      }
      if (popupPinned && activeContribution !== trigger) return;
      if (popupSelected && activeContribution === trigger) {
        popupSelected = false;
        hideContributionPopup();
        return;
      }
      showContributionPopup(trigger, true);
    });
    contributionPopup.addEventListener("pointerenter", cancelHidePopup);
    contributionPopup.addEventListener("pointerleave", scheduleHidePopup);
    contributionPopup.addEventListener("focusin", cancelHidePopup);
    contributionPopup.addEventListener("focusout", scheduleHidePopup);
    document.addEventListener("pointerdown", (event) => {
      if (!popupSelected || popupPinned) return;
      if (
        contributionPopup.contains(event.target) ||
        contributionsGrid.contains(event.target)
      ) {
        return;
      }
      popupSelected = false;
      hideContributionPopup();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !popupSelected || popupPinned) return;
      popupSelected = false;
      hideContributionPopup();
    });
    popupPin.addEventListener("click", () => {
      popupPinned = !popupPinned;
      popupPin.setAttribute("aria-pressed", String(popupPinned));
      popupPin.setAttribute(
        "aria-label",
        popupPinned ? "Unpin contribution pop-up" : "Pin contribution pop-up",
      );
      popupPin.title = popupPinned
        ? "Unpin contribution pop-up"
        : "Pin contribution pop-up";
      contributionPopup.classList.toggle("is-pinned", popupPinned);
      popupSelected = false;
      if (popupPinned) cancelHidePopup();
      else scheduleHidePopup();
    });
    popupHeader.addEventListener("pointerdown", (event) => {
      if (
        !event.isPrimary ||
        event.button !== 0 ||
        event.target.closest("button, a")
      ) {
        return;
      }
      const rect = contributionPopup.getBoundingClientRect();
      popupDrag = {
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      };
      popupHeader.setPointerCapture(event.pointerId);
      contributionPopup.classList.add("is-dragging");
      event.preventDefault();
    });
    popupHeader.addEventListener("pointermove", (event) => {
      if (!popupDrag || event.pointerId !== popupDrag.pointerId) return;
      const rect = contributionPopup.getBoundingClientRect();
      const margin = 12;
      const maxLeft = Math.max(margin, window.innerWidth - rect.width - margin);
      const maxTop = Math.max(margin, window.innerHeight - rect.height - margin);
      contributionPopup.style.left = `${Math.max(
        margin,
        Math.min(event.clientX - popupDrag.offsetX, maxLeft),
      )}px`;
      contributionPopup.style.top = `${Math.max(
        margin,
        Math.min(event.clientY - popupDrag.offsetY, maxTop),
      )}px`;
      popupMoved = true;
    });
    const stopPopupDrag = (event) => {
      if (!popupDrag || event.pointerId !== popupDrag.pointerId) return;
      popupDrag = null;
      contributionPopup.classList.remove("is-dragging");
    };
    popupHeader.addEventListener("pointerup", stopPopupDrag);
    popupHeader.addEventListener("pointercancel", stopPopupDrag);
    window.addEventListener("resize", positionContributionPopup);
    window.addEventListener("scroll", positionContributionPopup, true);
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
