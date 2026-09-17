document.addEventListener("DOMContentLoaded", () => {
  const die = document.querySelector(".d20-die");
  const rollButton = document.querySelector(".d20-randomize");
  const sparks = document.querySelector(".d20-button-sparks");

  if (!die || !rollButton || !sparks) {
    return;
  }

  const sides = 20;

  let lastFace = 1;
  let timeoutId = null;

  function randomFace() {
    let face;

    do {
      face = Math.floor(Math.random() * sides) + 1;
    } while (face === lastFace);

    lastFace = face;

    return face;
  }

  function createButtonSparks() {
    sparks.innerHTML = "";

    const particleCount = 42;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("span");

      particle.className = "d20-button-spark";

      const angle = Math.floor(Math.random() * 360);

      // Much larger burst
      const distance = 65 + Math.floor(Math.random() * 85);

      const size = 2 + Math.floor(Math.random() * 5);
      const delay = Math.floor(Math.random() * 180);

      particle.style.setProperty("--spark-angle", `${angle}deg`);
      particle.style.setProperty("--spark-distance", `${distance}px`);
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.animationDelay = `${delay}ms`;

      sparks.appendChild(particle);
    }
  }

  function roll() {
    clearTimeout(timeoutId);

    createButtonSparks();

    rollButton.classList.remove("sparkling");
    void rollButton.offsetWidth;
    rollButton.classList.add("sparkling");

    die.classList.remove("rolling");
    void die.offsetWidth;
    die.classList.add("rolling");

    timeoutId = setTimeout(() => {
      die.classList.remove("rolling");

      const result = randomFace();

      die.dataset.face = result;

      rollButton.classList.remove("sparkling");
    }, 3000);
  }

  rollButton.addEventListener("click", roll);
  die.addEventListener("click", roll);
});