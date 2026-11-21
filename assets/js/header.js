(() => {
  const root = document.documentElement;
  let updatePending = false;

  const updateScrollState = () => {
    root.classList.toggle("has-scrolled", window.scrollY > 0);
    updatePending = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (updatePending) return;
      updatePending = true;
      window.requestAnimationFrame(updateScrollState);
    },
    { passive: true },
  );

  updateScrollState();
})();
