export function initGalleryWeb(canvas, homeScreen) {
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("The gallery web canvas is not available.");
  }
  if (!(homeScreen instanceof HTMLElement)) {
    throw new Error("The artwork home screen is not available.");
  }

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("The browser could not create a 2D gallery canvas.");
  }

  const gallery = homeScreen;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = { x: 0, y: 0, active: false };
  const haloRadius = 500;
  const haloCanvas = document.createElement("canvas");
  haloCanvas.width = haloRadius * 2;
  haloCanvas.height = haloRadius * 2;
  const haloContext = haloCanvas.getContext("2d");
  if (!haloContext) {
    throw new Error("The browser could not create a 2D gallery halo.");
  }
  let points = [];
  let columns = 0;
  let rows = 0;
  let width = 0;
  let height = 0;
  let scale = 1;
  let frame = 0;
  let startTime = 0;
  let dirty = true;
  let dark = false;
  let lineColor = "";
  let lineOpacity = 0;
  let nodeColor = "";
  let nodeEdge = "";

  function updateTheme() {
    const styles = getComputedStyle(document.documentElement);
    dark = document.documentElement.dataset.theme === "dark";
    lineColor = "177, 166, 255";
    lineOpacity = dark ? 0.32 : 0.25;
    nodeColor = styles.getPropertyValue("--page").trim() || (dark ? "#111" : "#fff");
    nodeEdge = "rgba(177, 166, 255, 0.9)";

    const glowColor = "177, 166, 255";
    const halo = haloContext.createRadialGradient(
      haloRadius,
      haloRadius,
      0,
      haloRadius,
      haloRadius,
      haloRadius,
    );
    halo.addColorStop(0, `rgba(${glowColor}, 0.08)`);
    halo.addColorStop(0.45, `rgba(${glowColor}, 0.04)`);
    halo.addColorStop(0.85, `rgba(${glowColor}, 0.012)`);
    halo.addColorStop(1, `rgba(${glowColor}, 0)`);
    haloContext.clearRect(0, 0, haloCanvas.width, haloCanvas.height);
    haloContext.save();
    haloContext.beginPath();
    haloContext.arc(haloRadius, haloRadius, haloRadius, 0, Math.PI * 2);
    haloContext.clip();
    haloContext.fillStyle = halo;
    haloContext.fillRect(0, 0, haloCanvas.width, haloCanvas.height);
    haloContext.restore();
  }

  function resize() {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    scale = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(scale, 0, 0, scale, 0, 0);

    const spacing = 90;
    columns = Math.ceil(width / spacing) + 2;
    rows = Math.ceil(height / spacing) + 2;
    points = Array.from({ length: columns * rows }, (_, index) => {
      const column = Math.floor(index / rows);
      const row = index % rows;
      return {
        x: (column - 1) * spacing + (Math.random() - 0.5) * spacing * 0.5,
        y: (row - 1) * spacing + (Math.random() - 0.5) * spacing * 0.5,
        phase: Math.random() * 1000,
        duration: 20 + Math.random() * 40,
        range: 9 + Math.random() * 9,
        direction: Math.random() > 0.5 ? 1 : -1,
        drawX: 0,
        drawY: 0,
      };
    });
    dirty = true;
    draw(0);
    schedule();
  }

  function draw(elapsed) {
    if (!dirty && reducedMotion.matches) return;
    dirty = false;
    context.clearRect(0, 0, width, height);

    const pointerX = pointer.active ? pointer.x : width / 2 + Math.cos(elapsed * 0.0015) * 90;
    const pointerY = pointer.active ? pointer.y : height / 2 + Math.sin(elapsed * 0.0015) * 90;
    const influenceRadius = 180;

    for (const point of points) {
      const angle = (elapsed * 0.06) / point.duration + point.phase;
      let x = point.x + point.direction * Math.sin(angle) * point.range;
      let y = point.y + point.direction * Math.cos(angle) * point.range;
      const dx = x - pointerX;
      const dy = y - pointerY;
      const distance = Math.hypot(dx, dy);
      if (distance < influenceRadius && distance > 0) {
        const falloff = 1 - distance / influenceRadius;
        const push = falloff * falloff * 100;
        x += (dx / distance) * push;
        y += (dy / distance) * push;
      }
      point.drawX = x;
      point.drawY = y;
    }

    context.beginPath();
    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        const point = points[column * rows + row];
        const right = column + 1 < columns ? points[(column + 1) * rows + row] : null;
        const below = row + 1 < rows ? points[column * rows + row + 1] : null;
        if (right) {
          context.moveTo(point.drawX, point.drawY);
          context.lineTo(right.drawX, right.drawY);
        }
        if (below) {
          context.moveTo(point.drawX, point.drawY);
          context.lineTo(below.drawX, below.drawY);
        }
      }
    }
    context.lineWidth = 2;
    context.strokeStyle = `rgba(${lineColor}, ${lineOpacity})`;
    context.stroke();

    context.lineWidth = 1;
    context.fillStyle = nodeColor;
    context.strokeStyle = nodeEdge;
    for (const point of points) {
      context.save();
      context.translate(point.drawX, point.drawY);
      context.beginPath();
      context.arc(0, 0, 4, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.restore();
    }

    context.globalCompositeOperation = "screen";
    context.drawImage(haloCanvas, pointerX - haloRadius, pointerY - haloRadius);
    context.globalCompositeOperation = "source-over";
  }

  function tick(time) {
    frame = 0;
    if (!startTime) startTime = time;
    draw(time - startTime);
    schedule();
  }

  function schedule() {
    if (frame || document.hidden || gallery.hidden || reducedMotion.matches) return;
    frame = requestAnimationFrame(tick);
  }

  function stop() {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function trackPointer(event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    if (reducedMotion.matches) {
      dirty = true;
      draw(0);
    }
  }

  function releasePointer() {
    pointer.active = false;
    if (reducedMotion.matches) {
      dirty = true;
      draw(0);
    }
  }

  window.addEventListener("pointermove", trackPointer, { passive: true });
  window.addEventListener("pointerleave", releasePointer, { passive: true });
  window.addEventListener("pointerdown", trackPointer, { passive: true });

  window.addEventListener("resize", resize, { passive: true });
  canvas.hidden = gallery.hidden;
  const galleryObserver = new MutationObserver(() => {
    canvas.hidden = gallery.hidden;
    if (gallery.hidden) stop();
    else schedule();
  });
  galleryObserver.observe(gallery, { attributes: true, attributeFilter: ["hidden"] });

  const themeObserver = new MutationObserver(() => {
    updateTheme();
    dirty = true;
    draw(0);
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  reducedMotion.addEventListener("change", () => {
    dirty = true;
    draw(0);
    if (reducedMotion.matches) stop();
    else schedule();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else schedule();
  });

  updateTheme();
  resize();
}
