(() => {
  const checkbox = document.getElementById("mobile-menu-toggle");
  const dialog = document.getElementById("mobile-menu-dialog");
  document
    .querySelectorAll("#search-button, #search-button-mobile")
    .forEach((button) => {
      button.setAttribute("aria-label", "Search");
      button.title = "Search";
    });

  if (!checkbox || !dialog) return;

  const updateState = () => {
    const openButton = document.querySelector('[data-mobile-menu-button="open"]');
    if (openButton) {
      openButton.setAttribute("aria-expanded", String(checkbox.checked));
    }
  };
  const focusOpenButton = () => {
    document.querySelector('[data-mobile-menu-button="open"]')?.focus();
  };

  document
    .querySelectorAll('label[for="mobile-menu-toggle"][role="button"]')
    .forEach((label, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = label.className;
      button.dataset.mobileMenuButton = index === 0 ? "open" : "close";
      button.setAttribute(
        "aria-label",
        index === 0 ? "Main menu" : "Close menu",
      );
      button.setAttribute("aria-controls", "mobile-menu-dialog");
      button.setAttribute("aria-expanded", "false");
      button.innerHTML = label.innerHTML;
      label.replaceWith(button);

      button.addEventListener("click", (event) => {
        event.stopPropagation();
        checkbox.checked = button.dataset.mobileMenuButton === "open"
          ? !checkbox.checked
          : false;
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        updateState();
        if (!checkbox.checked) {
          focusOpenButton();
        } else {
          window.setTimeout(() => {
            if (checkbox.checked) {
              dialog.querySelector('[data-mobile-menu-button="close"]')?.focus();
            }
          }, 120);
        }
      });
    });

  checkbox.addEventListener("change", updateState);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!checkbox.checked) return;
    event.preventDefault();
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    updateState();
    focusOpenButton();
  }, true);

  document.addEventListener("click", (event) => {
    if (!checkbox.checked || !(event.target instanceof Element)) return;
    const target = event.target;
    if (
      dialog.contains(target) ||
      target.closest("[data-mobile-menu-button]")
    ) {
      return;
    }

    checkbox.checked = false;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    updateState();
    if (!target.closest("a, button, input, select, textarea, [tabindex]")) {
      focusOpenButton();
    }
  }, true);

  updateState();
})();
