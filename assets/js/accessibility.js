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

      button.addEventListener("click", () => {
        checkbox.checked = button.dataset.mobileMenuButton === "open"
          ? !checkbox.checked
          : false;
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        updateState();
        if (!checkbox.checked) {
          document
            .querySelector('[data-mobile-menu-button="open"]')
            ?.focus();
        } else {
          dialog.querySelector('[data-mobile-menu-button="close"]')?.focus();
        }
      });
    });

  checkbox.addEventListener("change", updateState);
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    updateState();
    document.querySelector('[data-mobile-menu-button="open"]')?.focus();
  });

  updateState();
})();
