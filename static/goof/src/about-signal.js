export function initAboutSignal(canvas, dialog) {
  if (!(canvas instanceof HTMLCanvasElement) || !(dialog instanceof HTMLDialogElement)) {
    throw new Error("The About GOOF signal effect could not find its canvas or dialog.");
  }

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("The browser could not create the About GOOF signal canvas.");
  }

  const scene = canvas.parentElement;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let width = 0;
  let height = 0;
  let scale = 1;
  let frame = 0;
  let tick = 0;
  let hasDrawn = false;

  function resize() {
    width = Math.max(1, scene.clientWidth);
    height = Math.max(1, scene.clientHeight);
    scale = Math.min(window.devicePixelRatio || 1, 1.5);
    const pixelWidth = Math.round(width * scale);
    const pixelHeight = Math.round(height * scale);
    const resized = canvas.width !== pixelWidth || canvas.height !== pixelHeight;
    if (resized) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      context.setTransform(scale, 0, 0, scale, 0, 0);
    }
    if (resized || !reducedMotion.matches || !hasDrawn) {
      draw();
      hasDrawn = true;
    }
  }

  function draw() {
    context.fillStyle = "rgba(4, 12, 18, 0.3)";
    context.fillRect(0, 0, width, height);
    const count = Math.max(80, Math.floor(height));
    for (let index = 0; index < count; index += 1) {
      const progress = index / count;
      const y = height * (0.18 + progress * 0.8);
      const spread = progress * width * 0.48;
      const wave = Math.sin((tick + index * 1.9) / 18) * (3 + progress * 8);
      const x = width / 2 + Math.sin((tick + index * 0.7) / 36) * spread * 0.22 + wave;
      const lineWidth = Math.max(1, progress * width * 0.72);
      const hue = (260 + tick + index * 0.5) % 360;
      const alpha = (1 - progress * 0.55) * (0.2 + Math.random() * 0.55);
      context.fillStyle = `hsla(${hue}, 90%, ${48 + Math.random() * 12}%, ${alpha})`;
      context.fillRect(
        x - lineWidth / 2 + Math.random() * 3 - 1.5,
        y,
        lineWidth * (0.94 + Math.random() * 0.12),
        1 + Math.random() * 1.5,
      );
    }
    context.fillStyle = "rgba(220, 250, 255, 0.16)";
    context.fillRect(0, Math.random() * height, width, 1);
  }

  function animate() {
    frame = 0;
    if (!dialog.open || reducedMotion.matches) return;
    tick += Math.random() > 0.2 ? 1 : 4 + Math.random() * 5;
    draw();
    frame = requestAnimationFrame(animate);
  }

  function start() {
    resize();
    if (reducedMotion.matches) {
      tick += 1;
      draw();
      return;
    }
    if (!frame) frame = requestAnimationFrame(animate);
  }

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  const observer = new ResizeObserver(resize);
  observer.observe(scene);
  dialog.addEventListener("close", stop);
  dialog.addEventListener("cancel", stop);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      stop();
      draw();
      hasDrawn = true;
    } else if (dialog.open) {
      start();
    }
  });

  resize();
  return { start, stop };
}
