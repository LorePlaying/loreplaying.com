import { DrawingCanvas } from "./drawing.js";
import {
  deleteCollection,
  deleteImageAsset,
  listCollections,
  listImageAssets,
  listProjects,
  saveCollection,
  saveImageAsset,
  saveProject,
} from "./library.js";

const canvas = document.querySelector("#drawing-canvas");
const selectButton = document.querySelector("#select-tool");
const shapesButton = document.querySelector("#shapes-tool");
const fillButton = document.querySelector("#fill-tool");
const fillOptionsPopover = document.querySelector("#fill-options-popover");
const fillModeInputs = document.querySelectorAll('input[name="fill-mode"]');
const brushButton = document.querySelector("#brush-tool");
const eraserButton = document.querySelector("#eraser-tool");
const brushKindInput = document.querySelector("#brush-kind");
const shapeDialog = document.querySelector("#shape-dialog");
const shapeOptions = document.querySelector("#shape-options");
const brushKindOptions = document.querySelector("#brush-kind-options");
const shapeFillInput = document.querySelector("#shape-fill");
const aboutDialog = document.querySelector("#about-dialog");
const aboutButton = document.querySelector("#about-button");
const closeAboutButton = document.querySelector("#close-about");
const simpleViewButton = document.querySelector("#simple-view");
const advancedViewButton = document.querySelector("#advanced-view");
const themeButton = document.querySelector("#theme-toggle");
const fullscreenButton = document.querySelector("#fullscreen-toggle");
const zoomLevel = document.querySelector("#zoom-level");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const sidebarToggle = document.querySelector("#sidebar-toggle");
const panelSidebarToggle = document.querySelector("#panel-sidebar-toggle");
const colorInput = document.querySelector("#brush-color");
const sizeInput = document.querySelector("#brush-size");
const sizeOutput = document.querySelector("#brush-size-value");
const toolSettingsPopover = document.querySelector("#tool-settings-popover");
const toolSettingsTitle = document.querySelector("#tool-settings-title");
const toolSettingsType = document.querySelector("#tool-settings-type");
const toolSettingsTypeLabel = document.querySelector("#tool-settings-type-label");
const clearButton = document.querySelector("#clear-canvas");
const addTextButton = document.querySelector("#add-text");
const addImageButton = document.querySelector("#add-image");
const imageFileInput = document.querySelector("#image-file");
const addLayerButton = document.querySelector("#add-layer");
const layerList = document.querySelector("#layer-list");
const addCollectionButton = document.querySelector("#add-collection");
const collectionList = document.querySelector("#collection-list");
const assetList = document.querySelector("#asset-list");
const assetSelectAllButton = document.querySelector("#asset-select-all");
const assetSelectionCount = document.querySelector("#asset-selection-count");
const assetAddSelectedButton = document.querySelector("#asset-add-selected");
const assetDeleteSelectedButton = document.querySelector("#asset-delete-selected");
const collapseAllPanesButton = document.querySelector("#toggle-all-panes");
const assetCount = document.querySelector("#asset-count");
const assetSearch = document.querySelector("#asset-search");
const assetFilterButtons = document.querySelectorAll("[data-asset-filter]");
const assetFilterToggle = document.querySelector("#asset-filter-toggle");
const assetFilters = document.querySelector("#asset-filters");
const brushKindControl = document.querySelector("#brush-kind-control");
const selectedShapeIcon = document.querySelector("#selected-shape-icon");
const selectedShapeName = document.querySelector("#selected-shape-name");
const selectedBrushIcon = document.querySelector("#selected-brush-icon");
const selectedBrushName = document.querySelector("#selected-brush-name");
const textEntry = document.querySelector("#canvas-text-entry");
const canvasDimensions = document.querySelector("#canvas-dimensions");
const canvasZoom = document.querySelector("#canvas-zoom");
const saveSceneButton = document.querySelector("#save-scene");
const saveMenu = document.querySelector("#save-menu");
const saveFormatButtons = document.querySelectorAll("[data-save-format]");
const openSceneButton = document.querySelector("#open-scene");
const sceneFileInput = document.querySelector("#scene-file");
const undoButton = document.querySelector("#undo-action");
const redoButton = document.querySelector("#redo-action");
const transparentButton = document.querySelector("#toggle-transparent");
const selectionControls = document.querySelector("#selection-controls");
const selectionLabel = document.querySelector("#selection-label");
const editSelectedTextButton = document.querySelector("#edit-selected-text");
const deleteSelectedButton = document.querySelector("#delete-selected");
const textDialog = document.querySelector("#text-dialog");
const collectionDialog = document.querySelector("#collection-dialog");
const collectionForm = document.querySelector("#collection-form");
const collectionNameInput = document.querySelector("#collection-name");
const cancelCollectionButton = document.querySelector("#cancel-collection");
const collectionDialogTitle = document.querySelector("#collection-dialog-title");
const layerDialog = document.querySelector("#layer-dialog");
const layerForm = document.querySelector("#layer-form");
const layerNameInput = document.querySelector("#layer-name");
const layerVisibleInput = document.querySelector("#layer-visible");
const layerLockedInput = document.querySelector("#layer-locked");
const layerOpacityInput = document.querySelector("#layer-opacity");
const layerOpacityValue = document.querySelector("#layer-opacity-value");
const layerDeleteButton = document.querySelector("#layer-delete");
const cancelLayerButton = document.querySelector("#cancel-layer");
const shapePropertiesDialog = document.querySelector("#shape-properties-dialog");
const shapePropertiesForm = document.querySelector("#shape-properties-form");
const shapeFillEnabledInput = document.querySelector("#shape-fill-enabled");
const shapeFillColorInput = document.querySelector("#shape-fill-color");
const shapeOutlineColorInput = document.querySelector("#shape-outline-color");
const cancelShapePropertiesButton = document.querySelector("#cancel-shape-properties");
const textForm = document.querySelector("#text-form");
const textDialogTitle = document.querySelector("#text-dialog-title");
const textContent = document.querySelector("#text-content");
const textColor = document.querySelector("#text-color");
const textSize = document.querySelector("#text-size");
const cancelTextButton = document.querySelector("#cancel-text");
const status = document.querySelector("#drawing-status");

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("The drawing canvas element could not be found.");
}

function openShapePropertiesDialog(item) {
  if (item?.type !== "shape" || item.locked) return;
  editingShapeId = item.id;
  shapeFillEnabledInput.checked = item.fill === true;
  shapeFillEnabledInput.disabled = ["line", "curve", "arc", "spiral"].includes(item.shape);
  colorPickerBindings.get("shape-fill-color")?.setColor(item.fillColor ?? item.color ?? colorInput.value);
  colorPickerBindings.get("shape-outline-color")?.setColor(item.color ?? colorInput.value);
  shapePropertiesDialog.showModal();
}

function updateBrushTool() {
  const [kind, label, icon] = brushKinds.find(([value]) => value === brushKindInput.value) ?? brushKinds[0];
  brushButton.querySelector("svg").replaceWith(iconSvg(icon, "selected-brush-icon"));
  selectedBrushName.textContent = label;
  brushButton.setAttribute("aria-label", label === "Brush" ? "Brush tool" : `${label} brush`);
  brushButton.title = label;
  for (const option of brushKindOptions.querySelectorAll("button")) {
    const selected = option.dataset.brushKind === kind;
    option.classList.toggle("is-active", selected);
    option.setAttribute("aria-pressed", String(selected));
  }
}

function renderBrushOptions() {
  brushKindOptions.replaceChildren();
  for (const [kind, label, icon] of brushKinds) {
    const option = document.createElement("button");
    option.className = "brush-kind-option";
    option.type = "button";
    option.dataset.brushKind = kind;
    option.setAttribute("aria-label", label);
    option.title = label;
    option.append(iconSvg(icon), document.createTextNode(label));
    option.addEventListener("click", () => {
      brushKindInput.value = kind;
      drawing.setBrush({ kind });
      updateBrushTool();
      status.textContent = `${label} selected.`;
    });
    brushKindOptions.append(option);
  }
  updateBrushTool();
}

const requiredElements = [
  selectButton, shapesButton, fillButton, brushButton, eraserButton, brushKindInput,
  fillOptionsPopover,
  shapeDialog, shapeOptions, shapeFillInput, aboutDialog, aboutButton, closeAboutButton,
  simpleViewButton, advancedViewButton,
  themeButton, fullscreenButton, zoomLevel, themeColorMeta, sidebarToggle, panelSidebarToggle,
  colorInput, sizeInput, sizeOutput, toolSettingsPopover, toolSettingsTitle, toolSettingsType,
  toolSettingsTypeLabel, clearButton,
  addTextButton, addImageButton, imageFileInput, addLayerButton, layerList,
  addCollectionButton, collectionList, assetList, assetCount, assetSearch,
  assetSelectAllButton, assetSelectionCount, assetAddSelectedButton, assetDeleteSelectedButton,
  canvasDimensions, canvasZoom, assetFilterToggle, assetFilters, brushKindControl,
  selectedShapeIcon, selectedShapeName, selectedBrushIcon, selectedBrushName,
  brushKindOptions, textEntry, collectionDialogTitle, layerDialog, layerForm,
  layerNameInput, layerVisibleInput, layerLockedInput, layerOpacityInput, layerOpacityValue,
  layerDeleteButton, cancelLayerButton,
  shapePropertiesDialog, shapePropertiesForm, shapeFillEnabledInput, shapeFillColorInput,
  shapeOutlineColorInput, cancelShapePropertiesButton,
  saveSceneButton, saveMenu, openSceneButton, sceneFileInput,
  undoButton, redoButton, transparentButton, collapseAllPanesButton,
  selectionControls, selectionLabel, editSelectedTextButton,
  deleteSelectedButton, textDialog, textForm, textDialogTitle, textContent, textColor,
  textSize, cancelTextButton, collectionDialog, collectionForm, collectionNameInput,
  cancelCollectionButton, status,
];

const brushKinds = [
  ["brush", "Brush", "M3 19c4 0 6-2 8-5l6-8 3 3-8 7c-3 2-5 3-9 3Zm10-7 4 3"],
  ["calligraphy-brush", "Calligraphy brush", "M4 20c4-1 6-4 8-8l5-9 3 2-4 10c-2 4-5 6-12 5Zm8-8 5 2"],
  ["calligraphy-pen", "Calligraphy pen", "M4 20 8 19 20 7l-3-3L5 16 4 20Zm11-14 3 3M7 16l2 2"],
  ["airbrush", "Airbrush", "M4 18h10l6-6-4-4-6 6H4v4Zm12-12 1-2m3 4 2-1m-7-4 1-2"],
  ["oil-brush", "Oil brush", "M4 20c5-1 6-4 9-8l5-7 3 2-5 8c-3 4-6 6-12 5Zm10-9 4 3"],
  ["crayon", "Crayon", "m5 16 9-11 5 4-9 12H5v-5Zm8-9 5 4M5 16l5 5"],
  ["marker", "Marker", "m5 16 10-12 5 4L10 20H5v-4Zm9-10 5 4m-9 9 4 2"],
  ["natural-pencil", "Natural pencil", "m4 19 3-7L17 2l5 5L12 17l-8 2Zm3-7 5 5m5-13 5 5"],
  ["watercolour-brush", "Watercolour brush", "M4 20c3-1 5-4 7-8l5-9 4 2-4 10c-2 4-6 6-12 5Zm8-9 5 3"],
];

function iconSvg(pathData, id = null) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  if (id) svg.id = id;
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathData);
  svg.append(path);
  return svg;
}
if (requiredElements.some((element) => !element)) {
  throw new Error("One or more drawing or library controls could not be found.");
}

const drawing = new DrawingCanvas(canvas);
const assetPreviews = new Map();
const selectedAssetIds = new Set();
const UNCATEGORIZED_COLLECTION_ID = "__uncategorized__";
let assetSelectionAnchorId = null;
let currentlyVisibleAssets = [];
let activeTool = "brush";
const toolTypes = { brush: "round", eraser: "round" };
let editingText = false;
let collections = [];
let assets = [];
const selectedCollectionIds = new Set();
let activeAssetFilter = "all";
let editingCollectionId = null;
let editingLayerId = null;
let editingShapeId = null;
let autosaveTimer = null;
let restoringAutosave = false;
let autosaveEnabled = false;

const shapes = [
  ["circle", "Circle"], ["oval", "Oval / Ellipse"], ["square", "Square"], ["rectangle", "Rectangle"],
  ["triangle", "Triangle"], ["right-triangle", "Right Triangle"], ["diamond", "Diamond"],
  ["pentagon", "Pentagon"], ["hexagon", "Hexagon"], ["octagon", "Octagon"], ["star", "Star"],
  ["heart", "Heart"], ["arrow", "Arrow"], ["line", "Line"], ["curve", "Curve"], ["arc", "Arc"],
  ["polygon", "Polygon"], ["freeform", "Freeform Shape"], ["rounded-rectangle", "Rounded Rectangle"],
  ["parallelogram", "Parallelogram"], ["trapezoid", "Trapezoid"], ["cross", "Cross"],
  ["crescent", "Crescent"], ["cloud", "Cloud"], ["speech-bubble", "Speech Bubble"],
  ["cylinder", "Cylinder"], ["cube", "Cube"], ["cone", "Cone"], ["ring", "Ring / Donut"],
  ["spiral", "Spiral"],
];

const shapeIcons = {
  circle: "M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  oval: "M21 12a9 6 0 1 1-18 0 9 6 0 0 1 18 0Z",
  square: "M5 5h14v14H5z",
  rectangle: "M3.5 6h17v12h-17z",
  triangle: "m12 3 9 17H3L12 3Z",
  "right-triangle": "M4 4v16h16L4 4Z",
  diamond: "m12 3 9 9-9 9-9-9 9-9Z",
  pentagon: "m12 3 9 7-3.5 11h-11L3 10l9-7Z",
  hexagon: "m7 4h10l5 8-5 8H7l-5-8 5-8Z",
  octagon: "m8 3h8l5 5v8l-5 5H8l-5-5V8l5-5Z",
  star: "m12 2.5 2.8 6.2 6.8.7-5 4.6 1.4 6.7-6-3.4-6 3.4 1.4-6.7-5-4.6 6.8-.7L12 2.5Z",
  heart: "M12 21S3 15.5 3 9a4.5 4.5 0 0 1 9-1.4A4.5 4.5 0 0 1 21 9c0 6.5-9 12-9 12Z",
  arrow: "M3 10h11V5l7 7-7 7v-5H3z",
  line: "M4 20 20 4",
  curve: "M4 19c3-14 13-14 16 0",
  arc: "M4 18a8 8 0 0 1 16 0",
  polygon: "m12 3 8 6-3 10H7L4 9l8-6Z",
  freeform: "M4 18 7 6l5 10 4-8 4 10",
  "rounded-rectangle": "M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z",
  parallelogram: "m7 5h14l-4 14H3L7 5Z",
  trapezoid: "m7 5h10l5 14H2L7 5Z",
  cross: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6z",
  crescent: "M18 4a9 9 0 1 0 2 15A8 8 0 0 1 18 4Z",
  cloud: "M6 18a4 4 0 0 1-.5-8A6.5 6.5 0 0 1 18 8a5 5 0 0 1 0 10H6Z",
  "speech-bubble": "M4 5h16v11h-9l-5 4v-4H4z",
  cylinder: "M4 7a8 3 0 1 0 16 0 8 3 0 1 0-16 0m0 0v10a8 3 0 0 0 16 0V7",
  cube: "m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 0v9m8-4.5-8 4.5m0 0-8-4.5m8 4.5v9",
  cone: "M12 3 4 19a8 3 0 0 0 16 0L12 3Z",
  ring: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  spiral: "M12 12m0-1a1 1 0 1 0 2 0 2 2 0 1 0-4 0 4 4 0 1 0 8 0 6 6 0 1 0-12 0",
};

function shapeIconSvg(kind) {
  return iconSvg(shapeIcons[kind] ?? shapeIcons.rectangle);
}

function updateShapeTool() {
  const [value, label] = shapes.find(([kind]) => kind === drawing.shapeKind) ?? shapes[3];
  shapesButton.querySelector("svg").replaceWith(shapeIconSvg(value));
  selectedShapeName.textContent = label;
  shapesButton.setAttribute("aria-label", `${label} shape`);
  shapesButton.title = `${label} — double-click to choose a shape`;
}

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function announceError(action, error) {
  const detail = error instanceof Error ? error.message : "Unknown error.";
  status.textContent = `${action}: ${detail}`;
  console.error(action, error);
}

function selectTool(tool) {
  activeTool = tool;
  drawing.setBrush({ tool, shape: toolTypes[tool] ?? drawing.brush.shape, kind: brushKindInput.value });
  const isSelect = tool === "select";
  const isBrush = tool === "brush";
  const isEraser = tool === "eraser";
  const isShapes = tool === "shapes";
  const isFill = tool === "fill";
  selectButton.classList.toggle("is-active", isSelect);
  selectButton.setAttribute("aria-pressed", String(isSelect));
  brushButton.classList.toggle("is-active", isBrush);
  brushButton.setAttribute("aria-pressed", String(isBrush));
  eraserButton.classList.toggle("is-active", isEraser);
  eraserButton.setAttribute("aria-pressed", String(isEraser));
  shapesButton.classList.toggle("is-active", isShapes);
  shapesButton.setAttribute("aria-pressed", String(isShapes));
  fillButton.classList.toggle("is-active", isFill);
  fillButton.setAttribute("aria-pressed", String(isFill));
  canvas.classList.toggle("eraser-active", isEraser);
  canvas.classList.toggle("move-active", isSelect);
  canvas.classList.toggle("select-active", isSelect);
  if (!isSelect) {
    canvas.classList.remove("object-hovered");
    canvas.classList.remove("resize-hovered");
  }

  const toolName = { select: "Select", shapes: shapes.find(([kind]) => kind === drawing.shapeKind)?.[1] ?? "Shapes", fill: "Fill", eraser: "Eraser", brush: "Brush" }[tool];
  status.textContent = `${toolName} tool selected.`;
}

function openToolSettings(tool) {
  if (tool !== "brush" && tool !== "eraser") return;
  selectTool(tool);
  toolSettingsTitle.textContent = `${tool === "brush" ? "Brush" : "Eraser"} settings`;
  toolSettingsPopover.setAttribute("aria-label", `${tool} settings`);
  toolSettingsTypeLabel.textContent = "Tip";
  brushKindControl.hidden = tool !== "brush";
  toolSettingsType.hidden = false;
  toolSettingsType.value = toolTypes[tool];
  const settingsButton = tool === "brush" ? brushButton : eraserButton;
  const toolbar = settingsButton.closest(".toolbar");
  if (toolbar.clientWidth < 360) {
    toolSettingsPopover.style.left = "auto";
    toolSettingsPopover.style.right = "8px";
  } else {
    toolSettingsPopover.style.right = "auto";
    const left = Math.min(settingsButton.offsetLeft, toolbar.clientWidth - 352);
    toolSettingsPopover.style.left = `${Math.max(8, left)}px`;
  }
  toolSettingsPopover.hidden = false;
  sizeInput.focus();
}

function setTheme(theme, persist = true) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  themeColorMeta.content = isDark ? "#191326" : "#fff5dc";
  themeButton.setAttribute("aria-pressed", String(isDark));
  const label = `Switch to ${isDark ? "light" : "dark"} mode`;
  themeButton.setAttribute("aria-label", label);
  themeButton.title = label;
  if (persist) {
    try {
      localStorage.setItem("goof-theme", theme);
    } catch (error) {
      announceError("Could not save the theme preference", error);
    }
  }
}

try {
  const savedTheme = localStorage.getItem("goof-theme");
  const initialTheme = savedTheme === "light" || savedTheme === "dark"
    ? savedTheme
    : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  setTheme(initialTheme, false);
} catch (error) {
  announceError("Could not read the theme preference", error);
  setTheme("light", false);
}

function renderLayers() {
  const layers = drawing.getLayers();
  layerList.replaceChildren();
  for (const layer of [...layers].reverse()) {
    const row = document.createElement("li");
    row.className = `layer-row${layer.id === drawing.activeLayerId ? " is-active" : ""}`;
    row.draggable = false;
    row.dataset.layerId = layer.id;
    row.addEventListener("click", (event) => {
      if (event.target.closest("button, input, label")) return;
      if (layer.visible && !layer.locked) drawing.selectLayer(layer.id);
    });
    const dragHandle = document.createElement("button");
    dragHandle.className = "layer-drag-handle";
    dragHandle.type = "button";
    dragHandle.draggable = true;
    dragHandle.setAttribute("aria-label", `Reorder ${layer.name}`);
    dragHandle.title = `Drag to reorder ${layer.name}`;
    dragHandle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="6" r="1"/><circle cx="16" cy="6" r="1"/><circle cx="8" cy="12" r="1"/><circle cx="16" cy="12" r="1"/><circle cx="8" cy="18" r="1"/><circle cx="16" cy="18" r="1"/></svg>';
    dragHandle.addEventListener("dragstart", (event) => {
      event.dataTransfer?.setData("text/plain", layer.id);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
      row.classList.add("is-dragging");
    });
    dragHandle.addEventListener("dragend", () => {
      for (const entry of layerList.children) entry.classList.remove("is-dragging", "drop-target");
    });
    row.addEventListener("dragover", (event) => {
      event.preventDefault();
      row.classList.add("drop-target");
    });
    row.addEventListener("dragleave", () => row.classList.remove("drop-target"));
    row.addEventListener("drop", (event) => {
      event.preventDefault();
      row.classList.remove("drop-target");
      const sourceId = event.dataTransfer?.getData("text/plain");
      if (sourceId && sourceId !== layer.id) drawing.reorderLayer(sourceId, layer.id);
    });

    const select = document.createElement("button");
    select.className = "layer-select";
    select.type = "button";
    select.textContent = layer.name;
    select.setAttribute("aria-pressed", String(layer.id === drawing.activeLayerId));
    select.setAttribute("aria-label", `Layer options for ${layer.name}, ${layer.itemCount} objects`);
    select.title = `Layer options for ${layer.name}`;
    select.addEventListener("click", () => {
      if (layer.visible && !layer.locked) drawing.selectLayer(layer.id);
      editingLayerId = layer.id;
      layerNameInput.value = layer.name;
      layerVisibleInput.checked = layer.visible;
      layerLockedInput.checked = layer.locked;
      layerOpacityInput.value = String(Math.round(layer.opacity * 100));
      layerOpacityValue.value = `${Math.round(layer.opacity * 100)}%`;
      layerOpacityValue.textContent = layerOpacityValue.value;
      layerDeleteButton.disabled = layers.length === 1;
      layerDialog.showModal();
      layerNameInput.focus();
      layerNameInput.select();
    });

    const visibility = document.createElement("button");
    visibility.className = "icon-button";
    visibility.type = "button";
    visibility.innerHTML = layer.visible
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.6"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3 21 21M10.6 6.2A10.8 10.8 0 0 1 12 6c6.2 0 9.5 6 9.5 6a15 15 0 0 1-2.8 3.4M6.2 6.5C3.8 8 2.5 12 2.5 12s3.3 6 9.5 6c1.1 0 2.1-.2 3-.5"/></svg>';
    visibility.title = `${layer.visible ? "Hide" : "Show"} ${layer.name}`;
    visibility.setAttribute("aria-label", visibility.title);
    visibility.setAttribute("aria-pressed", String(layer.visible));
    visibility.addEventListener("click", () => drawing.toggleLayerVisibility(layer.id));

    const lock = document.createElement("button");
    lock.className = "icon-button";
    lock.type = "button";
    lock.innerHTML = layer.locked
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.6-1.7M12 14v3"/></svg>';
    lock.title = `${layer.locked ? "Unlock" : "Lock"} ${layer.name}`;
    lock.setAttribute("aria-label", lock.title);
    lock.setAttribute("aria-pressed", String(layer.locked));
    lock.addEventListener("click", () => drawing.toggleLayerLock(layer.id));

    const remove = document.createElement("button");
    remove.className = "icon-button remove-layer";
    remove.type = "button";
    remove.textContent = "×";
    remove.title = `Delete ${layer.name}`;
    remove.setAttribute("aria-label", remove.title);
    remove.disabled = layers.length === 1;
    remove.addEventListener("click", () => drawing.removeLayer(layer.id));

    row.append(dragHandle, lock, select, visibility, remove);
    layerList.append(row);
  }
}

function renderSelection(selection) {
  const items = Array.isArray(selection) ? selection : selection ? [selection] : [];
  const item = items.length === 1 ? items[0] : null;
  const deletableCount = items.filter((entry) => !entry.locked).length;
  selectionControls.hidden = items.length === 0;
  editSelectedTextButton.hidden = item?.type !== "text";
  editSelectedTextButton.disabled = item?.locked === true;
  deleteSelectedButton.disabled = deletableCount === 0;
  if (items.length > 1) {
    selectionLabel.textContent = `${items.length} objects selected`;
    deleteSelectedButton.textContent = `Delete ${deletableCount} selected`;
  } else if (item) {
    deleteSelectedButton.textContent = item.type === "stroke" ? "Delete stroke" : "Delete object";
    const lockedNote = item.locked ? " — layer locked" : "";
    selectionLabel.textContent = item.type === "text"
      ? `Text selected: ${item.text.slice(0, 28)}${lockedNote}`
      : item.type === "image" ? `Image selected${lockedNote || " — drag to arrange it."}`
        : item.type === "shape" ? `Shape selected${lockedNote || " — drag to arrange it."}`
          : `Brush stroke selected${lockedNote || " — drag to arrange it."}`;
  } else {
    deleteSelectedButton.textContent = "Delete object";
  }
}

function makeAssetPreview(asset) {
  if (!assetPreviews.has(asset.id)) {
    const image = asset.imageAsset ?? asset;
    const url = image.blob instanceof Blob ? URL.createObjectURL(image.blob) : image.dataUrl;
    assetPreviews.set(asset.id, url);
  }
  return assetPreviews.get(asset.id);
}

function toggleCollectionSelection(collectionId) {
  if (selectedCollectionIds.has(collectionId)) selectedCollectionIds.delete(collectionId);
  else selectedCollectionIds.add(collectionId);
  renderCollections();
  renderAssetList();
}

function renderCollections() {
  collectionList.replaceChildren();
  const query = assetSearch.value.trim().toLocaleLowerCase();
  if (!query || "unsorted".includes(query)) {
    const unsorted = document.createElement("button");
    const isSelected = selectedCollectionIds.has(UNCATEGORIZED_COLLECTION_ID);
    unsorted.className = `collection-chip default-collection-chip${isSelected ? " is-active" : ""}`;
    unsorted.type = "button";
    unsorted.dataset.collectionId = UNCATEGORIZED_COLLECTION_ID;
    unsorted.textContent = "Unsorted";
    unsorted.setAttribute("aria-pressed", String(isSelected));
    unsorted.setAttribute("aria-label", `${isSelected ? "Deselect" : "Select"} unsorted assets`);
    unsorted.addEventListener("click", () => {
      toggleCollectionSelection(UNCATEGORIZED_COLLECTION_ID);
    });
    unsorted.addEventListener("dragover", (event) => {
      event.preventDefault();
      unsorted.classList.add("is-drop-target");
    });
    unsorted.addEventListener("dragleave", () => unsorted.classList.remove("is-drop-target"));
    unsorted.addEventListener("drop", async (event) => {
      event.preventDefault();
      unsorted.classList.remove("is-drop-target");
      const assetId = event.dataTransfer?.getData("text/asset-id");
      const asset = assets.find((entry) => entry.id === assetId);
      if (!asset) return;
      try {
        await saveImageAsset({ ...asset, collectionId: null });
        await refreshAssets();
        status.textContent = `Moved ${asset.name} to Unsorted.`;
      } catch (error) {
        announceError("Could not move this prop", error);
      }
    });
    collectionList.append(unsorted);
  }
  for (const collection of collections.filter((entry) => !query || entry.name.toLocaleLowerCase().includes(query))) {
    const entry = document.createElement("div");
    entry.className = "collection-entry";
    const button = document.createElement("button");
    const isSelected = selectedCollectionIds.has(collection.id);
    button.className = `collection-chip${isSelected ? " is-active" : ""}`;
    button.type = "button";
    button.dataset.collectionId = collection.id;
    button.textContent = collection.name;
    button.setAttribute("aria-pressed", String(isSelected));
    button.setAttribute("aria-label", `${isSelected ? "Deselect" : "Select"} ${collection.name} collection`);
    button.addEventListener("click", () => {
      toggleCollectionSelection(collection.id);
    });
    button.addEventListener("dragover", (event) => {
      event.preventDefault();
      button.classList.add("is-drop-target");
    });
    button.addEventListener("dragleave", () => button.classList.remove("is-drop-target"));
    button.addEventListener("drop", async (event) => {
      event.preventDefault();
      button.classList.remove("is-drop-target");
      const assetId = event.dataTransfer?.getData("text/asset-id");
      const asset = assets.find((entry) => entry.id === assetId);
      if (!asset) return;
      try {
        await saveImageAsset({
          ...asset,
          collectionId: collection.id === UNCATEGORIZED_COLLECTION_ID ? null : collection.id,
        });
        await refreshAssets();
        status.textContent = `Moved ${asset.name} to ${collection.name}.`;
      } catch (error) {
        announceError("Could not move this prop", error);
      }

    });
    const rename = document.createElement("button");
    rename.className = "collection-rename";
    rename.type = "button";
    rename.textContent = "✎";
    rename.title = `Rename ${collection.name}`;
    rename.setAttribute("aria-label", `Rename ${collection.name}`);
    rename.hidden = !isSelected;
    rename.addEventListener("click", () => openCollectionRename(collection));
    const remove = document.createElement("button");
    remove.className = "collection-delete";
    remove.type = "button";
    remove.textContent = "×";
    remove.title = `Delete ${collection.name}`;
    remove.setAttribute("aria-label", `Delete ${collection.name}`);
    remove.hidden = !isSelected;
    remove.addEventListener("click", () => removeCollection(collection));
    entry.append(button, rename, remove);
    collectionList.append(entry);
  }
}

function openCollectionRename(collection) {
  editingCollectionId = collection.id;
  collectionDialogTitle.textContent = "Rename collection";
  collectionNameInput.value = collection.name;
  collectionDialog.showModal();
  collectionNameInput.focus();
  collectionNameInput.select();
}

async function removeCollection(collection) {
  try {
    await deleteCollection(collection.id);
    selectedCollectionIds.delete(collection.id);
    await refreshAssets();
    status.textContent = `Deleted "${collection.name}".`;
  } catch (error) {
    announceError("Could not delete the collection", error);
  }

}

function updateCanvasStatus() {
  canvasDimensions.textContent = `${Math.round(drawing.width)} × ${Math.round(drawing.height)} px`;
  canvasZoom.textContent = `${Math.round(drawing.zoom * 100)}%`;
  zoomLevel.value = String(drawing.zoom);
}

const appShell = document.querySelector(".app-shell");
fullscreenButton.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await appShell.requestFullscreen();
    }
  } catch (error) {
    announceError("Could not change fullscreen mode", error);
  }
});
document.addEventListener("fullscreenchange", () => {
  const fullscreen = document.fullscreenElement === appShell;
  appShell.classList.toggle("fullscreen-mode", fullscreen);
  fullscreenButton.setAttribute("aria-label", `${fullscreen ? "Exit" : "Enter"} fullscreen workspace`);
  fullscreenButton.title = `${fullscreen ? "Exit" : "Enter"} fullscreen workspace`;
  updateCanvasStatus();
});

function finishTextEntry() {
  if (textEntry.hidden) return;
  const value = textEntry.value.trim();
  textEntry.hidden = true;
  if (!value) return;
  const item = drawing.addText({
    text: value,
    color: colorInput.value,
    fontSize: Number(textSize.value),
    x: Number.parseFloat(textEntry.dataset.x ?? "0.12"),
    y: Number.parseFloat(textEntry.dataset.y ?? "0.16"),
  });
  if (!item) {
    status.textContent = "Choose a visible, unlocked layer before adding text.";
    return;
  }
  textEntry.value = "";
  selectTool("select");
  status.textContent = "Text added. Double-click it on the canvas to edit.";
}

addTextButton.addEventListener("click", () => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.max(0, Math.min(0.75, (rect.width * 0.5) / Math.max(rect.width, 1)));
  const y = Math.max(0, Math.min(0.9, (rect.height * 0.5) / Math.max(rect.height, 1)));
  textEntry.dataset.x = String(x);
  textEntry.dataset.y = String(y);
  textEntry.style.left = `${Math.max(8, rect.width * 0.5)}px`;
  textEntry.style.top = `${Math.max(8, rect.height * 0.5)}px`;
  textEntry.hidden = false;
  textEntry.value = "";
  textEntry.focus();
  status.textContent = "Type directly on the canvas; Ctrl+Enter or click away to place the text.";
});
textEntry.addEventListener("blur", finishTextEntry);
textEntry.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    finishTextEntry();
  } else if (event.key === "Escape") {
    textEntry.value = "";
    textEntry.hidden = true;
  }
});
canvas.addEventListener("pointerdown", (event) => {
  if (textEntry.hidden) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  finishTextEntry();
}, true);

async function persistAutosave() {
  if (restoringAutosave || !autosaveEnabled) return;
  const referencedImageIds = new Set(drawing.getState().layers.flatMap((layer) =>
    layer.items.filter((item) => item.type === "image").map((item) => item.assetId)));
  const embeddedAssets = [...referencedImageIds].map((id) => {
    const asset = drawing.imageAssets.get(id);
    if (!asset) throw new Error(`Autosave cannot find image asset "${id}".`);
    return { id: asset.id, name: asset.name, blob: asset.blob, dataUrl: asset.dataUrl };
  });
  await saveProject({
    id: "goof-autosave",
    name: "GOOF automatic recovery",
    updatedAt: Date.now(),
    state: drawing.getState(),
    assets: embeddedAssets,
  });
}

function scheduleAutosave() {
  if (restoringAutosave || !autosaveEnabled) return;
  window.clearTimeout(autosaveTimer);
  autosaveTimer = window.setTimeout(() => {
    persistAutosave().then(() => {
      status.textContent = "Autosaved on this device.";
    }).catch((error) => announceError("Could not autosave the drawing", error));
  }, 650);
}

async function restoreAutosave() {
  const savedProjects = await listProjects();
  const autosave = savedProjects.find((project) => project.id === "goof-autosave");
  if (!autosave?.state?.layers?.length) return;
  restoringAutosave = true;
  try {
    drawing.setImageAssets([
      ...assets.filter((asset) => !asset.assetKind),
      ...(Array.isArray(autosave.assets) ? autosave.assets : []),
    ]);
    drawing.loadState(autosave.state);
    status.textContent = `Recovered your drawing from ${new Date(autosave.updatedAt).toLocaleString()}.`;
  } finally {
    restoringAutosave = false;
  }
  updateCanvasStatus();
}

function renderAssetList() {
  const query = assetSearch.value.trim().toLocaleLowerCase();
  const collectionFilteredAssets = selectedCollectionIds.size === 0
    ? assets
    : assets.filter((asset) => selectedCollectionIds.has(
      asset.collectionId ?? UNCATEGORIZED_COLLECTION_ID));
  const filteredAssets = collectionFilteredAssets.filter((asset) => {
    const kind = asset.assetKind === "scene-item" ? asset.item?.type : "image";
    const name = `${asset.name} ${asset.item?.text ?? ""} ${asset.item?.shape ?? ""}`.toLocaleLowerCase();
    return (activeAssetFilter === "all" || activeAssetFilter === kind) && (!query || name.includes(query));
  });
  currentlyVisibleAssets = filteredAssets;
  assetCount.textContent = String(filteredAssets.length);
  renderAssetSelectionControls();
  assetList.replaceChildren();
  if (!filteredAssets.length) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "No matching assets.";
    assetList.append(empty);
    return;
  }

  for (const asset of filteredAssets) {
    const card = document.createElement("div");
    card.className = `asset-card${selectedAssetIds.has(asset.id) ? " is-selected" : ""}`;
    card.draggable = true;
    card.addEventListener("dragstart", (event) => {
      event.dataTransfer?.setData("text/asset-id", asset.id);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
    });
    const select = document.createElement("button");
    select.className = "asset-add";
    select.type = "button";
    select.setAttribute("aria-pressed", String(selectedAssetIds.has(asset.id)));
    select.setAttribute("aria-label", `Select ${asset.name}`);
    select.title = `Select ${asset.name}; hold Shift to add to selection`;
    const kind = asset.assetKind === "scene-item" ? asset.item.type : "image";
    if (kind === "image") {
      const image = document.createElement("img");
      image.src = makeAssetPreview(asset);
      image.alt = "";
      image.loading = "lazy";
      select.append(image);
    } else {
      const icon = document.createElement("span");
      icon.className = `asset-kind-icon asset-kind-${kind}`;
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = { text: "T", stroke: "〰", shape: "◇" }[kind] ?? "✳";
      select.append(icon);
    }
    const name = document.createElement("span");
    name.textContent = asset.name;
    select.append(name);
    select.addEventListener("click", (event) => {
      const visibleIds = filteredAssets.map((entry) => entry.id);
      if (event.shiftKey && assetSelectionAnchorId) {
        const start = visibleIds.indexOf(assetSelectionAnchorId);
        const end = visibleIds.indexOf(asset.id);
        if (start >= 0 && end >= 0) {
          for (const id of visibleIds.slice(Math.min(start, end), Math.max(start, end) + 1)) selectedAssetIds.add(id);
        } else {
          selectedAssetIds.add(asset.id);
          assetSelectionAnchorId = asset.id;
        }
      } else if (event.ctrlKey || event.metaKey) {
        selectedAssetIds.has(asset.id) ? selectedAssetIds.delete(asset.id) : selectedAssetIds.add(asset.id);
        assetSelectionAnchorId = asset.id;
      } else {
        selectedAssetIds.clear();
        selectedAssetIds.add(asset.id);
        assetSelectionAnchorId = asset.id;
      }
      renderAssetList();
    });
    const add = document.createElement("button");
    add.className = "asset-place";
    add.type = "button";
    add.textContent = "+";
    add.title = `Add ${asset.name} to the canvas`;
    add.setAttribute("aria-label", add.title);
    add.addEventListener("click", async () => addAssetToCanvas(asset));
    const remove = document.createElement("button");
    remove.className = "icon-button asset-delete";
    remove.type = "button";
    remove.textContent = "×";
    remove.title = `Delete ${asset.name} from the library`;
    remove.setAttribute("aria-label", remove.title);
    remove.addEventListener("click", async (event) => {
      event.stopPropagation();
      try {
        await deleteImageAsset(asset.id);
        await refreshAssets();
        status.textContent = `Deleted ${asset.name} from Assets.`;
      } catch (error) {
        announceError("Could not delete this prop", error);
      }
    });
    card.append(select, add, remove);
    assetList.append(card);
  }
}

function renderAssetSelectionControls() {
  const selectedCount = selectedAssetIds.size;
  assetSelectAllButton.textContent = selectedCount ? "Deselect all" : "Select all";
  assetSelectionCount.textContent = selectedCount ? `${selectedCount} selected` : "";
  assetAddSelectedButton.hidden = selectedCount === 0;
  assetDeleteSelectedButton.hidden = selectedCount === 0;
  assetAddSelectedButton.textContent = `Add ${selectedCount} to canvas`;
  assetDeleteSelectedButton.textContent = `Delete ${selectedCount} selected`;
}

async function addAssetToCanvas(asset) {
  try {
    const placed = asset.assetKind === "scene-item"
      ? drawing.addSavedItem(asset)
      : await drawing.addImage(asset);
    if (placed) selectTool("select");
    status.textContent = placed
      ? `Added ${asset.name} to the canvas. Drag it to arrange it.`
      : "Choose a visible, unlocked layer to add this prop to the canvas.";
  } catch (error) {
    announceError("Could not add this prop", error);
  }
}

async function addSelectedAssetsToCanvas() {
  const selected = assets.filter((asset) => selectedAssetIds.has(asset.id));
  for (const asset of selected) {
    const layer = drawing.activeLayer();
    if (!layer || layer.locked || !layer.visible) {
      status.textContent = "Choose a visible, unlocked layer to add assets to the canvas.";
      return;
    }
    await addAssetToCanvas(asset);
  }
  if (selected.length) status.textContent = `Added ${selected.length} selected assets to the canvas.`;
}

async function deleteSelectedAssets() {
  const selected = assets.filter((asset) => selectedAssetIds.has(asset.id));
  if (!selected.length) return;
  try {
    for (const asset of selected) await deleteImageAsset(asset.id);
    selectedAssetIds.clear();
    assetSelectionAnchorId = null;
    await refreshAssets();
    status.textContent = `Deleted ${selected.length} selected ${selected.length === 1 ? "asset" : "assets"}.`;
  } catch (error) {
    announceError("Could not delete the selected assets", error);
    await refreshAssets();
  }
}

async function refreshAssets() {
  assets = (await listImageAssets()).filter((asset) => !asset.assetKind || asset.assetKind === "scene-item");
  collections = await listCollections();
  const availableIds = new Set(assets.map((asset) => asset.id));
  for (const id of selectedAssetIds) {
    if (!availableIds.has(id)) selectedAssetIds.delete(id);
  }
  if (assetSelectionAnchorId && !availableIds.has(assetSelectionAnchorId)) assetSelectionAnchorId = null;
  for (const [id, url] of assetPreviews) {
    if (!availableIds.has(id)) {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      assetPreviews.delete(id);
    }
  }
  for (const id of selectedCollectionIds) {
    if (id !== UNCATEGORIZED_COLLECTION_ID && !collections.some((collection) => collection.id === id)) {
      selectedCollectionIds.delete(id);
    }
  }
  drawing.setImageAssets(assets);
  renderCollections();
  renderAssetList();
}

async function saveActiveLayerToAssets() {
  const layer = drawing.layers.find((entry) => entry.id === drawing.activeLayerId);
  if (!layer || !layer.items.length) {
    status.textContent = "The active layer is empty; add items to it before saving to Assets.";
    return;
  }
  const items = layer.items.map((item) => structuredClone(item));
  const missingImage = items.find((item) =>
    item.type === "image" && !drawing.imageAssets.has(item.assetId));
  if (missingImage) {
    throw new Error(`The selected image asset "${missingImage.assetId}" is missing.`);
  }
  const selectedCollectionId = selectedCollectionIds.size === 1 ? [...selectedCollectionIds][0] : null;
  const collectionId = selectedCollectionId === UNCATEGORIZED_COLLECTION_ID ? null : selectedCollectionId;
  for (const item of items) {
    const category = item.type === "text" ? "Text" : item.type === "image" ? "Image" : item.type === "shape" ? item.shape : "Scribble";
    const imageAsset = item.type === "image" ? drawing.imageAssets.get(item.assetId) : undefined;
    await saveImageAsset({
      id: createId("asset"),
      assetKind: "scene-item",
      category: item.type,
      name: item.type === "text" ? item.text.slice(0, 32) : `${category} asset`,
      item,
      imageAsset,
      createdAt: Date.now(),
      collectionId,
    });
  }
  await refreshAssets();
  status.textContent = `Saved ${layer.items.length} ${layer.items.length === 1 ? "item" : "items"} from "${layer.name}" to Assets.`;
}

function openTextDialog(item = null) {
  editingText = item !== null;
  textDialogTitle.textContent = editingText ? "Edit text" : "Add text";
  textContent.value = item?.text ?? "";
  textColor.value = item?.color ?? colorInput.value;
  document.querySelector("#text-color-chip").style.backgroundColor = textColor.value;
  document.querySelector("#text-color-trigger").setAttribute("aria-label", `Choose text color, current ${textColor.value}`);
  textSize.value = String(item?.fontSize ?? 32);
  textDialog.showModal();
  textContent.focus();
}

selectButton.addEventListener("click", () => selectTool("select"));
brushButton.addEventListener("click", () => selectTool("brush"));
eraserButton.addEventListener("click", () => selectTool("eraser"));
function openShapePicker() {
  shapeOptions.replaceChildren();
  for (const [value, label] of shapes) {
    const option = document.createElement("button");
    option.className = `shape-option${drawing.shapeKind === value ? " is-active" : ""}`;
    option.type = "button";
    option.append(shapeIconSvg(value), document.createTextNode(label));
    option.setAttribute("aria-pressed", String(drawing.shapeKind === value));
    option.addEventListener("click", () => {
      drawing.shapeKind = value;
      updateShapeTool();
      shapeDialog.close();
      selectTool("shapes");
      status.textContent = `${label} selected. Drag on the canvas to draw it.`;
    });
    shapeOptions.append(option);
  }
  shapeFillInput.checked = drawing.shapeFill;
  shapeDialog.showModal();
}
shapesButton.addEventListener("click", () => selectTool("shapes"));
shapesButton.addEventListener("dblclick", openShapePicker);
shapeFillInput.addEventListener("change", () => {
  drawing.shapeFill = shapeFillInput.checked;
});
fillButton.addEventListener("click", () => selectTool("fill"));
fillButton.addEventListener("dblclick", () => {
  fillOptionsPopover.hidden = !fillOptionsPopover.hidden;
});
fillModeInputs.forEach((input) => input.addEventListener("change", () => {
  if (!input.checked) return;
  drawing.fillMode = input.value;
  const label = input.value === "smart" ? "Smart" : input.value === "canvas" ? "Canvas background" : "Shape under pointer";
  status.textContent = `Fill target set to ${label}.`;
}));
document.addEventListener("pointerdown", (event) => {
  if (!fillOptionsPopover.hidden && !fillOptionsPopover.contains(event.target) &&
      !fillButton.contains(event.target)) fillOptionsPopover.hidden = true;
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !fillOptionsPopover.hidden) fillOptionsPopover.hidden = true;
});
brushKindInput.addEventListener("change", () => {
  drawing.setBrush({ kind: brushKindInput.value });
  updateBrushTool();
});
zoomLevel.addEventListener("input", () => drawing.setZoom(Number(zoomLevel.value)));
canvas.addEventListener("wheel", (event) => {
  if (!(event.ctrlKey || event.metaKey)) return;
  event.preventDefault();
  const step = event.deltaY < 0 ? 0.1 : -0.1;
  drawing.setZoom(drawing.zoom + step);
}, { passive: false });
colorInput.addEventListener("input", () => drawing.setBrush({ color: colorInput.value }));
assetSearch.addEventListener("input", () => {
  renderCollections();
  renderAssetList();
});
assetSelectAllButton.addEventListener("click", () => {
  if (selectedAssetIds.size) {
    selectedAssetIds.clear();
    assetSelectionAnchorId = null;
  } else {
    for (const asset of currentlyVisibleAssets) selectedAssetIds.add(asset.id);
    assetSelectionAnchorId = currentlyVisibleAssets[0]?.id ?? null;
  }
  renderAssetList();
});
assetAddSelectedButton.addEventListener("click", () => {
  void addSelectedAssetsToCanvas();
});
assetDeleteSelectedButton.addEventListener("click", () => {
  void deleteSelectedAssets();
});
canvas.addEventListener("pointerdown", () => {
  if (selectedAssetIds.size) {
    selectedAssetIds.clear();
    assetSelectionAnchorId = null;
    renderAssetList();
  }
  canvas.focus({ preventScroll: true });
});
for (const button of assetFilterButtons) {
  button.addEventListener("click", () => {
    activeAssetFilter = button.dataset.assetFilter;
    for (const option of assetFilterButtons) {
      const active = option === button;
      option.classList.toggle("is-active", active);
      option.setAttribute("aria-pressed", String(active));
    }
    renderAssetList();
  });
}
assetFilterToggle.addEventListener("click", () => {
  const expanded = assetFilterToggle.getAttribute("aria-expanded") === "true";
  assetFilterToggle.setAttribute("aria-expanded", String(!expanded));
  assetFilters.hidden = expanded;
  assetFilterToggle.title = `${expanded ? "Expand" : "Collapse"} asset filters`;
});
assetFilterToggle.title = "Collapse asset filters";
aboutButton.addEventListener("click", () => aboutDialog.showModal());
closeAboutButton.addEventListener("click", () => aboutDialog.close());
brushButton.title = "Brush";
eraserButton.title = "Eraser";
brushButton.addEventListener("dblclick", () => openToolSettings("brush"));
eraserButton.addEventListener("dblclick", () => openToolSettings("eraser"));
document.addEventListener("pointerdown", (event) => {
  if (!toolSettingsPopover.hidden &&
      !toolSettingsPopover.contains(event.target) &&
      !brushButton.contains(event.target) &&
      !eraserButton.contains(event.target)) {
    toolSettingsPopover.hidden = true;
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !toolSettingsPopover.hidden) {
    toolSettingsPopover.hidden = true;
  }
});
toolSettingsType.addEventListener("change", () => {
  toolTypes[activeTool] = toolSettingsType.value;
  drawing.setBrush({ tool: activeTool, shape: toolSettingsType.value });
});

function closeOnBackdrop(dialog) {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}
for (const dialog of [textDialog, collectionDialog, layerDialog, shapeDialog, aboutDialog, shapePropertiesDialog]) {
  closeOnBackdrop(dialog);
}

layerOpacityInput.addEventListener("input", () => {
  layerOpacityValue.value = `${layerOpacityInput.value}%`;
  layerOpacityValue.textContent = layerOpacityValue.value;
});
cancelLayerButton.addEventListener("click", () => layerDialog.close());
layerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!editingLayerId) return;
  try {
    const updated = drawing.updateLayerProperties(editingLayerId, {
      name: layerNameInput.value,
      visible: layerVisibleInput.checked,
      locked: layerLockedInput.checked,
      opacity: Number(layerOpacityInput.value) / 100,
    });
    if (updated) status.textContent = "Layer options saved.";
    layerDialog.close();
  } catch (error) {
    announceError("Could not save layer options", error);
  }
});
layerDeleteButton.addEventListener("click", () => {
  if (editingLayerId && drawing.removeLayer(editingLayerId)) {
    status.textContent = "Layer deleted.";
    layerDialog.close();
  }
});
shapePropertiesForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!editingShapeId) return;
  if (drawing.updateShapeStyle(editingShapeId, {
    fill: shapeFillEnabledInput.checked,
    fillColor: shapeFillColorInput.value,
    color: shapeOutlineColorInput.value,
  })) {
    status.textContent = "Shape fill and outline updated.";
  }
  shapePropertiesDialog.close();
});
cancelShapePropertiesButton.addEventListener("click", () => shapePropertiesDialog.close());
shapePropertiesDialog.addEventListener("close", () => {
  editingShapeId = null;
});
themeButton.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});
function toggleSidebar() {
  const isExpanded = panelSidebarToggle.getAttribute("aria-expanded") === "true";
  const nextExpanded = !isExpanded;
  document.querySelector(".editor-layout").classList.toggle("sidebar-collapsed", !nextExpanded);
  for (const button of [sidebarToggle, panelSidebarToggle]) {
    button.setAttribute("aria-expanded", String(nextExpanded));
  }
  sidebarToggle.setAttribute("aria-label", `${nextExpanded ? "Collapse" : "Expand"} left sidebar`);
  sidebarToggle.title = `${nextExpanded ? "Collapse" : "Expand"} sidebar`;
  sidebarToggle.querySelector("span").textContent = `${nextExpanded ? "Hide" : "Show"} panel`;
  panelSidebarToggle.setAttribute("aria-label", `${nextExpanded ? "Collapse" : "Expand"} left sidebar`);
  panelSidebarToggle.title = `${nextExpanded ? "Hide" : "Show"} panel`;
  panelSidebarToggle.querySelector("span").textContent = `${nextExpanded ? "Hide" : "Show"} panel`;
  status.textContent = `${nextExpanded ? "Sidebar expanded." : "Sidebar collapsed; canvas expanded."}`;
}

sidebarToggle.addEventListener("click", toggleSidebar);
panelSidebarToggle.addEventListener("click", toggleSidebar);
collapseAllPanesButton.addEventListener("click", () => {
  const panes = [...document.querySelectorAll(".panel-section")];
  const shouldOpen = panes.some((pane) => pane.open);
  for (const pane of panes) pane.open = !shouldOpen;
  const label = shouldOpen ? "Expand all panes" : "Collapse all panes";
  collapseAllPanesButton.setAttribute("aria-label", label);
  collapseAllPanesButton.title = label;
});

const colorPickerBindings = new Map();

function setupColorPicker(triggerId, popoverId, inputId, chipId) {
  const trigger = document.querySelector(`#${triggerId}`);
  const popover = document.querySelector(`#${popoverId}`);
  const input = document.querySelector(`#${inputId}`);
  const chip = document.querySelector(`#${chipId}`);
  const wheel = popover.querySelector("[data-color-wheel]");
  const saturationValue = popover.querySelector("[data-color-sv]");
  const palette = popover.querySelector("[data-palette]");
  const saveButton = popover.querySelector("[data-palette-save]");
  const [whiteButton, blackButton] = popover.querySelectorAll("[data-color-extreme]");
  const paletteKey = `goof-palette-${inputId}`;
  const paletteSlots = 12;
  let colors = Array(paletteSlots).fill(null);
  let selectedSlot = -1;
  let hsv = hexToHsv(input.value);
  try {
    const stored = JSON.parse(localStorage.getItem(paletteKey) ?? "[]");
    if (Array.isArray(stored)) {
      colors = colors.map((_, index) => typeof stored[index] === "string" &&
        /^#[\da-f]{6}$/i.test(stored[index]) ? stored[index] : null);
    }
  } catch (error) {
    announceError("Could not load saved palette", error);
  }
  const renderPalette = () => {
    palette.replaceChildren();
    colors.forEach((color, index) => {
      const swatch = document.createElement("button");
      swatch.className = `palette-swatch${color ? "" : " is-empty"}`;
      swatch.type = "button";
      swatch.disabled = !color;
      if (color) {
        swatch.style.backgroundColor = color;
        swatch.title = `Choose ${color}`;
        swatch.setAttribute("aria-label", `Choose ${color}`);
        swatch.addEventListener("click", () => {
          selectedSlot = index;
          setColor(color);
          saveButton.hidden = true;
        });
      } else {
        swatch.setAttribute("aria-label", `Empty palette slot ${index + 1}`);
      }
      palette.append(swatch);
    });
  };
  const updatePickerSurface = () => {
    saturationValue.style.backgroundColor = `hsl(${hsv.h} 100% 50%)`;
    saturationValue.style.backgroundImage =
      "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)";
    saturationValue.style.setProperty("--saturation-x", `${hsv.s * 100}%`);
    saturationValue.style.setProperty("--brightness-y", `${(1 - hsv.v) * 100}%`);
    wheel.style.setProperty("--selected-hue", `${hsv.h}`);
    wheel.setAttribute("aria-valuenow", String(Math.round(hsv.h)));
    wheel.setAttribute("aria-valuetext", `Hue ${Math.round(hsv.h)} degrees`);
  };
  const setColor = (color) => {
    input.value = color;
    hsv = hexToHsv(color);
    updatePickerSurface();
    chip.style.backgroundColor = color;
    trigger.setAttribute("aria-label", `Choose color, current ${color}`);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };

  colorPickerBindings.set(inputId, { setColor, input, chip, trigger });
  chip.style.backgroundColor = input.value;
  updatePickerSurface();
  renderPalette();
  saveButton.addEventListener("click", () => {
    const emptySlot = colors.indexOf(null);
    const slot = emptySlot >= 0 ? emptySlot : selectedSlot >= 0 ? selectedSlot : 0;
    colors[slot] = input.value;
    selectedSlot = slot;
    try {
      localStorage.setItem(paletteKey, JSON.stringify(colors));
      renderPalette();
      saveButton.hidden = true;
      status.textContent = `Saved ${input.value} to palette slot ${slot + 1}.`;
    } catch (error) {
      announceError("Could not save color to palette", error);
    }
  });
  input.addEventListener("input", () => {
    hsv = hexToHsv(input.value);
    updatePickerSurface();
    chip.style.backgroundColor = input.value;
    trigger.setAttribute("aria-label", `Choose color, current ${input.value}`);
    saveButton.hidden = false;
  });
  trigger.addEventListener("click", () => {
    const willOpen = popover.hidden;
    for (const other of document.querySelectorAll(".color-popover")) other.hidden = true;
    for (const other of document.querySelectorAll(".color-trigger")) other.setAttribute("aria-expanded", "false");
    popover.hidden = !willOpen;
    trigger.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) {
      popover.style.position = "fixed";
      const anchorBounds = popover.id === "text-color-popover"
        ? textSize.getBoundingClientRect()
        : trigger.getBoundingClientRect();
      const popupBounds = popover.getBoundingClientRect();
      const left = window.innerWidth - anchorBounds.right >= popupBounds.width + 12
        ? anchorBounds.right + 8
        : Math.max(12, anchorBounds.left - popupBounds.width - 8);
      const below = anchorBounds.bottom + 8;
      const top = below + popupBounds.height <= window.innerHeight - 12
        ? below
        : Math.max(12, anchorBounds.top - popupBounds.height - 8);
      popover.style.left = `${left}px`;
      popover.style.top = `${top}px`;
    }
  });
  const chooseWheelHue = (event) => {
    const bounds = wheel.getBoundingClientRect();
    const angle = Math.atan2(event.clientY - bounds.top - bounds.height / 2, event.clientX - bounds.left - bounds.width / 2);
    hsv.h = (angle * 180 / Math.PI + 360 + 90) % 360;
    setColor(hsvToHex(hsv.h, hsv.s, hsv.v));
  };
  wheel.addEventListener("pointerdown", (event) => {
    wheel.setPointerCapture(event.pointerId);
    chooseWheelHue(event);
  });
  wheel.addEventListener("pointermove", (event) => {
    if (event.buttons) chooseWheelHue(event);
  });
  wheel.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" || event.key === "ArrowUp" ? 5 : -5;
    hsv.h = (hsv.h + delta + 360) % 360;
    setColor(hsvToHex(hsv.h, hsv.s, hsv.v));
  });
  const chooseSaturationValue = (event) => {
    const bounds = saturationValue.getBoundingClientRect();
    hsv.s = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    hsv.v = 1 - Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    setColor(hsvToHex(hsv.h, hsv.s, hsv.v));
  };
  saturationValue.addEventListener("pointerdown", (event) => {
    saturationValue.setPointerCapture(event.pointerId);
    chooseSaturationValue(event);
  });
  saturationValue.addEventListener("pointermove", (event) => {
    if (event.buttons || event.pressure > 0) chooseSaturationValue(event);
  });
  saturationValue.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") hsv = { ...hsv, s: 0, v: 1 };
    else if (event.key === "End") hsv = { ...hsv, s: 1, v: 0 };
    else {
      const delta = event.key === "ArrowRight" || event.key === "ArrowUp" ? 0.05 : -0.05;
      hsv.s = Math.max(0, Math.min(1, hsv.s + (event.key === "ArrowLeft" || event.key === "ArrowRight" ? delta : 0)));
      hsv.v = Math.max(0, Math.min(1, hsv.v + (event.key === "ArrowDown" || event.key === "ArrowUp" ? delta : 0)));
    }
    setColor(hsvToHex(hsv.h, hsv.s, hsv.v));
  });
  whiteButton.addEventListener("click", () => setColor("#ffffff"));
  blackButton.addEventListener("click", () => setColor("#000000"));
  document.addEventListener("pointerdown", (event) => {
    if (!popover.hidden && !popover.contains(event.target) && !trigger.contains(event.target)) {
      popover.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !popover.hidden) {
      popover.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus();
    }
  });
}

function hexToHsv(hex) {
  const value = hex.replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16) / 255;
  const green = Number.parseInt(value.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(value.slice(4, 6), 16) / 255;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const delta = maximum - minimum;
  let hue = 0;
  if (delta) {
    if (maximum === red) hue = ((green - blue) / delta) % 6;
    else if (maximum === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return { h: hue, s: maximum === 0 ? 0 : delta / maximum, v: maximum };
}

function hsvToHex(hue, saturation, value) {
  const chroma = value * saturation;
  const segment = hue / 60;
  const secondary = chroma * (1 - Math.abs(segment % 2 - 1));
  const [red, green, blue] = segment < 1 ? [chroma, secondary, 0]
    : segment < 2 ? [secondary, chroma, 0]
      : segment < 3 ? [0, chroma, secondary]
        : segment < 4 ? [0, secondary, chroma]
          : segment < 5 ? [secondary, 0, chroma] : [chroma, 0, secondary];
  const offset = value - chroma;
  return `#${[red, green, blue].map((channel) =>
    Math.round((channel + offset) * 255).toString(16).padStart(2, "0")).join("")}`;
}

setupColorPicker("brush-color-trigger", "brush-color-popover", "brush-color", "brush-color-chip");
setupColorPicker("text-color-trigger", "text-color-popover", "text-color", "text-color-chip");
setupColorPicker("shape-fill-color-trigger", "shape-fill-color-popover", "shape-fill-color", "shape-fill-color-chip");
setupColorPicker("shape-outline-color-trigger", "shape-outline-color-popover", "shape-outline-color", "shape-outline-color-chip");

function setViewMode(isAdvanced) {
  const useAdvanced = isAdvanced && !mobileViewQuery.matches;
  document.querySelector(".drawing-app").classList.toggle("simple-view", !useAdvanced);
  simpleViewButton.classList.toggle("is-active", !useAdvanced);
  simpleViewButton.setAttribute("aria-pressed", String(!useAdvanced));
  advancedViewButton.classList.toggle("is-active", useAdvanced);
  advancedViewButton.setAttribute("aria-pressed", String(useAdvanced));
  status.textContent = `${useAdvanced ? "Studio" : "Simple"} view enabled.`;
}

const mobileViewQuery = window.matchMedia("(max-width: 760px)");
simpleViewButton.addEventListener("click", () => setViewMode(false));
advancedViewButton.addEventListener("click", () => setViewMode(true));
mobileViewQuery.addEventListener("change", (event) => {
  if (event.matches) setViewMode(false);
});
if (mobileViewQuery.matches) setViewMode(false);

sizeInput.addEventListener("input", () => {
  const size = Number(sizeInput.value);
  sizeOutput.value = `${size} px`;
  sizeOutput.textContent = `${size} px`;
  drawing.setBrush({ size });
});

clearButton.addEventListener("click", () => {
  const cleared = drawing.clear();
  status.textContent = cleared
    ? "Canvas, background, and layers cleared."
    : "Canvas is already clear.";
});

saveSceneButton.addEventListener("click", async () => {
  const isOpen = !saveMenu.hidden;
  saveMenu.hidden = isOpen;
  saveSceneButton.setAttribute("aria-expanded", String(!isOpen));
});

for (const button of saveFormatButtons) {
  button.addEventListener("click", async () => {
    saveMenu.hidden = true;
    saveSceneButton.setAttribute("aria-expanded", "false");
    try {
      if (button.dataset.saveFormat === "goof") {
        await drawing.saveScene();
        status.textContent = "Editable GOOF scene saved.";
      } else if (button.dataset.saveFormat === "png") {
        await drawing.exportPng();
        status.textContent = "PNG drawing downloaded.";
      } else if (button.dataset.saveFormat === "svg") {
        await drawing.exportSvg();
        status.textContent = "SVG scene exported.";
      } else if (button.dataset.saveFormat === "asset") {
        await saveActiveLayerToAssets();
      } else {
        throw new Error(`Unsupported save format: ${button.dataset.saveFormat}`);
      }
    } catch (error) {
      const format = button.dataset.saveFormat?.toUpperCase() ?? "file";
      announceError(`${format} export failed`, error);
    }
  });
}

document.addEventListener("pointerdown", (event) => {
  if (!saveMenu.hidden && !saveMenu.contains(event.target) && !saveSceneButton.contains(event.target)) {
    saveMenu.hidden = true;
    saveSceneButton.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !saveMenu.hidden) {
    saveMenu.hidden = true;
    saveSceneButton.setAttribute("aria-expanded", "false");
    saveSceneButton.focus();
  }
});

openSceneButton.addEventListener("click", () => sceneFileInput.click());
sceneFileInput.addEventListener("change", async () => {
  const file = sceneFileInput.files?.[0];
  sceneFileInput.value = "";
  if (!file) return;
  try {
    const scene = JSON.parse(await file.text());
    drawing.loadSceneData(scene);
    status.textContent = `Opened ${file.name}.`;
  } catch (error) {
    announceError("Could not open this GOOF scene", error);
  }
});

undoButton.addEventListener("click", () => {
  if (drawing.undo()) status.textContent = "Undo complete.";
});
redoButton.addEventListener("click", () => {
  if (drawing.redo()) status.textContent = "Redo complete.";
});
transparentButton.addEventListener("click", () => {
  drawing.toggleTransparentCanvas();
  const transparent = drawing.transparentCanvas;
  transparentButton.setAttribute("aria-pressed", String(transparent));
  transparentButton.setAttribute("aria-label", `${transparent ? "Disable" : "Enable"} transparent canvas`);
  transparentButton.title = `${transparent ? "Disable" : "Enable"} transparent canvas`;
  status.textContent = `Transparent canvas ${transparent ? "enabled" : "disabled"}.`;
});

cancelTextButton.addEventListener("click", () => textDialog.close());
textForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const options = {
    text: textContent.value,
    color: textColor.value,
    fontSize: Number(textSize.value),
  };
  const changed = editingText
    ? drawing.updateSelectedText(options)
    : drawing.addText(options);
  if (!changed) {
    status.textContent = "Choose a visible, unlocked layer and enter some text first.";
    return;
  }
  selectTool("select");
  textDialog.close();
  status.textContent = editingText
    ? "Text updated. Use Select to arrange or resize it."
    : "Text added. Use Select to arrange or resize it.";
});

addImageButton.addEventListener("click", () => imageFileInput.click());
imageFileInput.addEventListener("change", async () => {
  const file = imageFileInput.files?.[0];
  imageFileInput.value = "";
  if (!file) {
    return;
  }
  if (!file.type.startsWith("image/")) {
    status.textContent = "Choose a supported image file.";
    return;
  }
  try {
    const asset = {
      id: createId("asset"),
      name: file.name,
      blob: file,
      createdAt: Date.now(),
      collectionId: selectedCollectionIds.size === 1 &&
        [...selectedCollectionIds][0] !== UNCATEGORIZED_COLLECTION_ID
        ? [...selectedCollectionIds][0]
        : null,
    };
    await saveImageAsset(asset);
    await refreshAssets();
    const placed = await drawing.addImage(asset);
    if (placed) {
      selectTool("select");
    }
    status.textContent = placed
      ? `Saved ${file.name} to the prop library and added it to the canvas.`
      : `Saved ${file.name} to the prop library. Choose a visible, unlocked layer to add it to the canvas.`;
  } catch (error) {
    announceError("Could not save or add this image", error);
  }
});

addLayerButton.addEventListener("click", () => {
  const layer = drawing.addLayer();
  status.textContent = `Added ${layer.name}.`;
});

addCollectionButton.addEventListener("click", async (event) => {
  event.preventDefault();
  event.stopPropagation();
  collectionNameInput.value = "";
  collectionDialog.showModal();
  collectionNameInput.focus();
});
cancelCollectionButton.addEventListener("click", () => collectionDialog.close());
collectionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = collectionNameInput.value.trim();
  if (!name) return;
  try {
    const collection = editingCollectionId
      ? collections.find((entry) => entry.id === editingCollectionId)
      : { id: createId("collection"), createdAt: Date.now() };
    if (!collection) throw new Error("The collection to rename no longer exists.");
    collection.name = name.slice(0, 40);
    await saveCollection(collection);
    selectedCollectionIds.clear();
    selectedCollectionIds.add(collection.id);
    await refreshAssets();
    collectionDialog.close();
    status.textContent = `${editingCollectionId ? "Renamed" : "Created"} collection "${collection.name}".`;
    editingCollectionId = null;
    collectionDialogTitle.textContent = "New asset collection";
  } catch (error) {
    announceError("Could not create the collection", error);
  }
});
collectionDialog.addEventListener("close", () => {
  editingCollectionId = null;
  collectionDialogTitle.textContent = "New asset collection";
});

editSelectedTextButton.addEventListener("click", () => {
  const item = drawing.getSelectedItem();
  if (item?.type === "text") {
    openTextDialog(item);
  }
});

deleteSelectedButton.addEventListener("click", () => {
  const deletableCount = drawing.getSelectedItems().filter((item) => !item.locked).length;
  if (drawing.deleteSelectedItem()) {
    status.textContent = `Deleted ${deletableCount} selected ${deletableCount === 1 ? "object" : "objects"}.`;
  }
});

drawing.onChange = () => {
  renderLayers();
  updateCanvasStatus();
  scheduleAutosave();
  const transparent = drawing.transparentCanvas;
  transparentButton.setAttribute("aria-pressed", String(transparent));
  transparentButton.setAttribute("aria-label", `${transparent ? "Disable" : "Enable"} transparent canvas`);
  transparentButton.title = `${transparent ? "Disable" : "Enable"} transparent canvas`;
  canvas.style.backgroundColor = transparent ? "transparent" : drawing.backgroundColor;
};
drawing.onHistoryChange = () => {
  undoButton.disabled = drawing.undoStack.length === 0;
  redoButton.disabled = drawing.redoStack.length === 0;
};
drawing.onSelectionChange = (item) => renderSelection(item);
drawing.onFill = ({ target, color } = {}) => {
  if (target === "shape") status.textContent = `Shape filled with ${color}.`;
  else if (target === "canvas") status.textContent = `Canvas background changed to ${color}.`;
  else status.textContent = "No fillable shape under the pointer. Choose Canvas-only mode to fill the background.";
};
drawing.onEditText = (item) => openTextDialog(item);
drawing.onEditShape = (item) => openShapePropertiesDialog(item);
drawing.onShapeCreated = () => selectTool("select");
drawing.onStrokeEnd = () => {
  status.textContent = "Stroke added to canvas.";
};
drawing.onPointerDown = () => {
  drawing.setBrush({
    color: colorInput.value,
    size: Number(sizeInput.value),
    tool: activeTool,
    shape: toolTypes[activeTool] ?? drawing.brush.shape,
    kind: brushKindInput.value,
  });
};
drawing.onZoomChange = updateCanvasStatus;

async function initializeWasmBrushWidth() {
  try {
    const wasm = await import("../rust-engine/pkg/goof_rust_engine.js");
    await wasm.default();
    if (typeof wasm.effective_brush_width !== "function") {
      throw new Error("The generated WASM package does not export effective_brush_width.");
    }
    drawing.setWidthCalculator(wasm.effective_brush_width);
    status.textContent = "Rust/WASM pressure-sensitive brush sizing is ready.";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown WASM initialization error.";
    status.textContent = `Rust/WASM is unavailable; using standard brush sizing. (${message})`;
    console.warn("Rust/WASM brush sizing could not be initialized.", error);
  }
}

async function initializeLibrary() {
  try {
    await refreshAssets();
    await restoreAutosave();
    autosaveEnabled = true;
  } catch (error) {
    announceError("Could not open local storage; drawing is still available", error);
  }
}

window.addEventListener("beforeunload", () => {
  for (const url of assetPreviews.values()) {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }
});

window.addEventListener("pagehide", () => {
  window.clearTimeout(autosaveTimer);
  persistAutosave().catch((error) => console.error("Could not save the recovery snapshot before closing.", error));
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isEditing = target instanceof HTMLElement &&
    (target.isContentEditable || target.matches("input, textarea, select"));
  const modalOpen = textDialog.open || collectionDialog.open || layerDialog.open ||
    shapeDialog.open || aboutDialog.open || shapePropertiesDialog.open;
  if (event.key === "Escape" && !modalOpen) {
    const popupOpen = [...document.querySelectorAll(".color-popover, #tool-settings-popover, #fill-options-popover, #save-menu")]
      .some((element) => !element.hidden);
    if (popupOpen) return;
    if (selectedAssetIds.size) {
      selectedAssetIds.clear();
      assetSelectionAnchorId = null;
      renderAssetList();
    }
    if (drawing.selectedItemIds.length) drawing.setSelectedItems([]);
    status.textContent = "Selection cleared.";
    return;
  }
  if (event.code === "Space" && !isEditing && !modalOpen &&
      (target === document.body || target === canvas)) {
    event.preventDefault();
    drawing.setPanMode(true);
    return;
  }
  if (isEditing || modalOpen) return;
  const modifier = event.ctrlKey || event.metaKey;
  if (modifier && event.key.toLowerCase() === "a" &&
      (target === canvas || document.activeElement === canvas)) {
    event.preventDefault();
    selectTool("select");
    const selected = drawing.selectAllItems();
    status.textContent = selected
      ? `Selected all ${selected} objects on the canvas. Drag, resize, or rotate the group.`
      : "There are no unlocked visible canvas objects to select.";
  } else if (modifier && event.key.toLowerCase() === "z") {
    event.preventDefault();
    const changed = event.shiftKey ? drawing.redo() : drawing.undo();
    if (changed) status.textContent = event.shiftKey ? "Redo complete." : "Undo complete.";
  } else if (modifier && event.key.toLowerCase() === "y") {
    event.preventDefault();
    if (drawing.redo()) status.textContent = "Redo complete.";
  } else if (event.key === "Delete" || event.key === "Backspace") {
    if (selectedAssetIds.size) {
      event.preventDefault();
      void deleteSelectedAssets();
    } else {
      const deletableCount = drawing.getSelectedItems().filter((item) => !item.locked).length;
      if (drawing.deleteSelectedItem()) {
        event.preventDefault();
        status.textContent = `Deleted ${deletableCount} selected ${deletableCount === 1 ? "object" : "objects"}.`;
      }
    }
  }
});
document.addEventListener("keyup", (event) => {
  if (event.code === "Space" && drawing.spacePan) {
    drawing.setPanMode(false);
  }
});
window.addEventListener("blur", () => {
  if (drawing.spacePan) drawing.setPanMode(false);
});

for (const panel of document.querySelectorAll(".panel-section")) {
  const summary = panel.querySelector("summary");
  if (!summary) continue;
  const updateTitle = () => {
    summary.title = `${panel.open ? "Collapse" : "Expand"} ${summary.querySelector("h2")?.textContent ?? "panel"}`;
  };
  panel.addEventListener("toggle", updateTitle);
  updateTitle();
}

renderBrushOptions();
drawing.onChange();
updateCanvasStatus();
void initializeWasmBrushWidth();
void initializeLibrary();
