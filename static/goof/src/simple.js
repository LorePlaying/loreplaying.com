import { DrawingCanvas } from "./drawing.js";

const canvas = document.querySelector("#drawing-canvas");
const editor = document.querySelector("#text-entry");
const menuToggle = document.querySelector("#menu-toggle");
const menu = document.querySelector("#app-menu");
const shapeToggle = document.querySelector("#shape-tool");
const shapeMenu = document.querySelector("#shape-menu");
const colorInput = document.querySelector("#color-input");
const sizeInput = document.querySelector("#size-input");
const colorSwatch = document.querySelector("#color-swatch");
const sizePreview = document.querySelector("#size-preview");
const undoButton = document.querySelector("#undo-button");
const redoButton = document.querySelector("#redo-button");
const statusMessage = document.querySelector("#status-message");
const zoomLevel = document.querySelector("#zoom-level");
const drawing = new DrawingCanvas(canvas);

let activeTool = "select";
let editingTextId = null;
let editingPoint = null;
let saveTimer = 0;
let statusTimer = 0;
let databasePromise = null;
let initialized = false;

drawing.setInfiniteCanvas(true);

function showStatus(message, duration = 1800) {
  statusMessage.textContent = message;
  statusMessage.classList.add("is-visible");
  window.clearTimeout(statusTimer);
  if (duration > 0) {
    statusTimer = window.setTimeout(() => statusMessage.classList.remove("is-visible"), duration);
  }
}

function openDatabase() {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open("goof-infinite-canvas", 1);
    request.addEventListener("upgradeneeded", () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("workspace")) {
        database.createObjectStore("workspace", { keyPath: "id" });
      }
    });
    request.addEventListener("success", () => resolve(request.result), { once: true });
    request.addEventListener("error", () => reject(request.error ?? new Error("Could not open local drawing storage.")), { once: true });
  });
  return databasePromise;
}

async function readWorkspace() {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("workspace", "readonly");
    const request = transaction.objectStore("workspace").get("current");
    request.addEventListener("success", () => resolve(request.result ?? null), { once: true });
    request.addEventListener("error", () => reject(request.error ?? new Error("Could not load the saved drawing.")), { once: true });
  });
}

async function writeWorkspace(value) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("workspace", "readwrite");
    transaction.objectStore("workspace").put(value);
    transaction.addEventListener("complete", resolve, { once: true });
    transaction.addEventListener("error", () => reject(transaction.error ?? new Error("Could not save the drawing.")), { once: true });
    transaction.addEventListener("abort", () => reject(transaction.error ?? new Error("Saving the drawing was interrupted.")), { once: true });
  });
}

function scheduleSave() {
  if (!initialized) return;
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(async () => {
    try {
      await writeWorkspace({
        id: "current",
        state: drawing.getState(),
        color: colorInput.value,
        size: Number(sizeInput.value),
        view: { zoom: drawing.zoom, pan: { ...drawing.pan } },
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Could not save the drawing.", error);
      showStatus("Could not save this drawing");
    }
  }, 300);
}

function updateHistory({ canUndo = drawing.undoStack.length > 0, canRedo = drawing.redoStack.length > 0 } = {}) {
  undoButton.disabled = !canUndo;
  redoButton.disabled = !canRedo;
  menu.querySelector('[data-action="undo"]').disabled = !canUndo;
  menu.querySelector('[data-action="redo"]').disabled = !canRedo;
}

function updateBrush() {
  const color = colorInput.value;
  const size = Number(sizeInput.value);
  colorSwatch.style.backgroundColor = color;
  sizePreview.style.setProperty("--brush-size", `${Math.min(26, size)}px`);
  sizePreview.style.setProperty("--preview-color", color);
  drawing.setBrush({ color, size });
  scheduleSave();
}

function syncToolButtons() {
  document.querySelectorAll("[data-tool]").forEach((button) => {
    const selected = button.dataset.tool === activeTool;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  shapeToggle.classList.toggle("is-active", activeTool === "shapes");
  const panMode = activeTool === "hand";
  drawing.setPanMode(panMode);
  canvas.classList.toggle("is-panning", panMode);
  canvas.classList.toggle("is-selecting", activeTool === "select");
  canvas.classList.toggle("is-drawing", activeTool === "brush");
  canvas.classList.toggle("is-erasing", activeTool === "eraser");
  if (activeTool !== "text") {
    canvas.classList.remove("is-typing");
  }
  const brushTool = activeTool === "hand" ? "select" : activeTool === "text" ? "select" : activeTool;
  drawing.setBrush({ tool: brushTool });
}

function setTool(tool) {
  if (tool === "text") {
    activeTool = "text";
    closeShapeMenu();
    syncToolButtons();
    showStatus("Click anywhere to add text");
    return;
  }
  activeTool = tool;
  closeShapeMenu();
  syncToolButtons();
}

function closeMenu() {
  menu.hidden = true;
  menuToggle.setAttribute("aria-expanded", "false");
}

function closeShapeMenu() {
  shapeMenu.hidden = true;
  shapeToggle.setAttribute("aria-expanded", "false");
}

function setZoomAt(nextZoom, clientX, clientY) {
  const bounds = canvas.getBoundingClientRect();
  const anchorX = clientX - bounds.left - bounds.width / 2;
  const anchorY = clientY - bounds.top - bounds.height / 2;
  const oldZoom = drawing.zoom;
  const newZoom = Math.max(0.25, Math.min(10, nextZoom));
  const ratio = newZoom / oldZoom;
  drawing.pan = {
    x: (1 - ratio) * anchorX + ratio * drawing.pan.x,
    y: (1 - ratio) * anchorY + ratio * drawing.pan.y,
  };
  drawing.setZoom(newZoom);
}

function screenPoint(point) {
  const bounds = canvas.getBoundingClientRect();
  return {
    x: bounds.left + bounds.width / 2 + drawing.pan.x + (point.x - 0.5) * bounds.width * drawing.zoom,
    y: bounds.top + bounds.height / 2 + drawing.pan.y + (point.y - 0.5) * bounds.height * drawing.zoom,
  };
}

function showTextEditor(point, item = null) {
  editingTextId = item?.id ?? null;
  editingPoint = item ? { x: item.x, y: item.y } : point;
  const location = screenPoint(editingPoint);
  const appBounds = document.querySelector(".app-shell").getBoundingClientRect();
  editor.style.left = `${location.x - appBounds.left}px`;
  editor.style.top = `${location.y - appBounds.top}px`;
  editor.style.fontSize = `${(item?.fontSize ?? 24) * drawing.zoom}px`;
  editor.style.color = item?.color ?? colorInput.value;
  editor.innerText = item?.text ?? "";
  editor.hidden = false;
  canvas.classList.add("is-typing");
  editor.focus();
  if (item) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

function finishTextEditor(commit = true) {
  if (editor.hidden) return;
  const text = editor.innerText.trim();
  editor.hidden = true;
  canvas.classList.remove("is-typing");
  if (commit && text && editingPoint) {
    if (editingTextId) {
      drawing.updateSelectedText({ text, color: colorInput.value, fontSize: Number.parseFloat(editor.style.fontSize) / drawing.zoom });
    } else {
      drawing.addText({
        text,
        color: colorInput.value,
        fontSize: Number.parseFloat(editor.style.fontSize) / drawing.zoom,
        x: editingPoint.x,
        y: editingPoint.y,
      });
    }
    setTool("select");
  }
  editingPoint = null;
  editingTextId = null;
}

function startTextAtPointer(event) {
  if (activeTool !== "text" || event.button !== 0) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  showTextEditor(drawing.normalizedPoint(event));
}

function updateZoomLabel(zoom = drawing.zoom) {
  zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
  updateGrid();
}

function updateGrid() {
  const shell = document.querySelector(".app-shell");
  shell.style.backgroundSize = `${20 * drawing.zoom}px ${20 * drawing.zoom}px`;
  shell.style.backgroundPosition = `calc(50% + ${drawing.pan.x}px) calc(50% + ${drawing.pan.y}px)`;
}

drawing.onChange = scheduleSave;
drawing.onHistoryChange = updateHistory;
drawing.onZoomChange = (zoom) => {
  updateZoomLabel(zoom);
  scheduleSave();
};
drawing.onEditText = (item) => showTextEditor({ x: item.x, y: item.y }, item);
drawing.onPointerDown = () => {
  if (!editor.hidden) finishTextEditor(true);
};
canvas.addEventListener("pointerdown", startTextAtPointer, { capture: true });

document.querySelectorAll("[data-tool]").forEach((button) => {
  button.addEventListener("click", () => setTool(button.dataset.tool));
});

shapeToggle.addEventListener("click", () => {
  const shouldClose = !shapeMenu.hidden;
  setTool("shapes");
  shapeMenu.hidden = shouldClose;
  shapeToggle.setAttribute("aria-expanded", String(!shapeMenu.hidden));
});

shapeMenu.querySelectorAll("[data-shape]").forEach((button) => {
  button.addEventListener("click", () => {
    const shape = button.dataset.shape;
    drawing.shapeKind = shape;
    drawing.setBrush({ tool: "shapes" });
    activeTool = "shapes";
    syncToolButtons();
    shapeToggle.classList.add("is-active");
    closeShapeMenu();
    showStatus(`${button.getAttribute("aria-label")} selected`);
  });
});

menuToggle.addEventListener("click", () => {
  menu.hidden = !menu.hidden;
  menuToggle.setAttribute("aria-expanded", String(!menu.hidden));
});

menu.addEventListener("click", async (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  closeMenu();
  try {
    if (action === "export-png") {
      await drawing.exportPng();
      showStatus("PNG exported");
    } else if (action === "export-svg") {
      await drawing.exportSvg();
      showStatus("SVG exported");
    } else if (action === "undo") {
      drawing.undo();
    } else if (action === "redo") {
      drawing.redo();
    } else if (action === "clear") {
      if (window.confirm("Clear everything on this canvas? This can be undone.")) {
        drawing.clear();
        drawing.setInfiniteCanvas(true);
        showStatus("Canvas cleared");
      }
    } else if (action === "theme") {
      const dark = document.documentElement.dataset.theme !== "dark";
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      event.target.textContent = `Switch to ${dark ? "light" : "dark"} mode`;
      try {
        localStorage.setItem("goof-canvas-theme", dark ? "dark" : "light");
      } catch (error) {
        console.error("Could not save the theme preference.", error);
      }
    }
  } catch (error) {
    console.error(`Could not ${action.replace("-", " ")}.`, error);
    showStatus("Something went wrong");
  }
});

colorInput.addEventListener("input", updateBrush);
sizeInput.addEventListener("input", updateBrush);
undoButton.addEventListener("click", () => drawing.undo());
redoButton.addEventListener("click", () => drawing.redo());
document.querySelector("#zoom-out").addEventListener("click", () => setZoomAt(drawing.zoom / 1.2, window.innerWidth / 2, window.innerHeight / 2));
document.querySelector("#zoom-in").addEventListener("click", () => setZoomAt(drawing.zoom * 1.2, window.innerWidth / 2, window.innerHeight / 2));
zoomLevel.addEventListener("click", () => {
  drawing.pan = { x: 0, y: 0 };
  drawing.setZoom(1);
});

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  setZoomAt(drawing.zoom * Math.exp(-event.deltaY * 0.001), event.clientX, event.clientY);
}, { passive: false });
canvas.addEventListener("pointermove", () => {
  if (drawing.interaction?.type === "pan" || drawing.interaction?.type === "touch-pan") updateGrid();
}, { capture: true });
canvas.addEventListener("pointerup", () => {
  updateGrid();
  scheduleSave();
});
canvas.addEventListener("pointercancel", scheduleSave);

editor.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    finishTextEditor(false);
  } else if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    finishTextEditor(true);
  }
});
editor.addEventListener("blur", () => finishTextEditor(true));

document.addEventListener("pointerdown", (event) => {
  if (!event.target.closest(".menu-wrap")) closeMenu();
  if (!event.target.closest(".shape-wrap")) closeShapeMenu();
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const typing = target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
  if (!typing && event.code === "Space") {
    event.preventDefault();
    drawing.setPanMode(true);
    canvas.classList.add("is-panning");
    return;
  }
  if (!typing && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    if (event.shiftKey) drawing.redo();
    else drawing.undo();
    return;
  }
  if (typing || event.ctrlKey || event.metaKey || event.altKey) return;
  const tool = { v: "select", d: "brush", e: "eraser", h: "hand", s: "shapes", t: "text" }[event.key.toLowerCase()];
  if (tool) setTool(tool);
  if (event.key === "Delete" || event.key === "Backspace") drawing.deleteSelectedItem();
  if (event.key === "Escape") {
    closeMenu();
    closeShapeMenu();
  }
});

document.addEventListener("keyup", (event) => {
  if (event.code === "Space" && activeTool !== "hand") {
    drawing.setPanMode(false);
    canvas.classList.remove("is-panning");
  }
});
window.addEventListener("blur", () => {
  if (activeTool !== "hand") drawing.setPanMode(false);
});

async function initialize() {
  try {
    const saved = await readWorkspace();
    if (saved?.state) {
      drawing.loadState(saved.state);
      drawing.setInfiniteCanvas(true);
      if (/^#[\da-f]{6}$/i.test(saved.color ?? "")) colorInput.value = saved.color;
      if (Number.isFinite(saved.size)) sizeInput.value = String(Math.max(1, Math.min(48, saved.size)));
      if (Number.isFinite(saved.view?.zoom)) drawing.zoom = Math.max(0.25, Math.min(10, saved.view.zoom));
      if (Number.isFinite(saved.view?.pan?.x) && Number.isFinite(saved.view?.pan?.y)) {
        drawing.pan = { x: saved.view.pan.x, y: saved.view.pan.y };
      }
      drawing.render();
    }
  } catch (error) {
    console.error("Could not restore the saved drawing.", error);
    showStatus("Could not load the saved drawing");
  }

  try {
    const theme = localStorage.getItem("goof-canvas-theme");
    const dark = theme === "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    menu.querySelector('[data-action="theme"]').textContent = `Switch to ${dark ? "light" : "dark"} mode`;
  } catch (error) {
    console.error("Could not load the theme preference.", error);
  }
  updateBrush();
  updateHistory();
  updateZoomLabel();
  initialized = true;
  scheduleSave();
}

initialize();
