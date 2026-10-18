import { DrawingCanvas } from "./drawing.js";
import { initAboutSignal } from "./about-signal.js";
import { initGalleryWeb } from "./gallery-web.js";
import {
  deleteCollection,
  deleteImageAsset,
  deleteProject,
  listCollections,
  listImageAssets,
  listNotes,
  listProjects,
  saveCollection,
  saveImageAsset,
  saveNote,
  saveProject,
  deleteNote,
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
const polygonSidesControl = document.querySelector("#polygon-sides-control");
const polygonSidesInput = document.querySelector("#polygon-sides");
const polygonSidesValue = document.querySelector("#polygon-sides-value");
const objectContextMenu = document.querySelector("#object-context-menu");
const brushKindOptions = document.querySelector("#brush-kind-options");
const shapeFillInput = document.querySelector("#shape-fill");
const shapeStrokeInput = document.querySelector("#shape-stroke");
const aboutDialog = document.querySelector("#about-dialog");
const aboutButton = document.querySelector("#about-button");
const homeAboutButton = document.querySelector("#gallery-about-button");
const aboutSignalCanvas = document.querySelector("#about-signal-canvas");
const closeAboutButton = document.querySelector("#close-about");
const workspaceActionsToggle = document.querySelector("#workspace-actions-toggle");
const workspaceActionsMenu = document.querySelector("#workspace-actions-menu");
const themeButton = document.querySelector("#theme-toggle");
const fullscreenButton = document.querySelector("#fullscreen-toggle");
const zoomLevel = document.querySelector("#zoom-level");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const sidebarToggle = document.querySelector("#sidebar-toggle");
const assetsToggle = document.querySelector("#assets-toggle");
const panelSidebarToggle = document.querySelector("#panel-sidebar-toggle");
const editorPanel = document.querySelector("#editor-panel");
const workspacePanelTabs = document.querySelectorAll("[data-workspace-panel]");
const assetsPanelView = document.querySelector("#assets-panel-view");
const layersPanelView = document.querySelector("#layers-panel-view");
const railModifierLabel = document.querySelector("#rail-modifier-label");
const notesToggle = document.querySelector("#notes-toggle");
const notesPanel = document.querySelector("#notes-panel");
const notesSaveButton = document.querySelector("#notes-save");
const notesSaveMenu = document.querySelector("#notes-save-menu");
const savedNotesToggle = document.querySelector("#saved-notes-toggle");
const savedNotesPopover = document.querySelector("#saved-notes-popover");
const savedNotesList = document.querySelector("#saved-notes-list");
const notesFormatButtons = document.querySelectorAll("[data-notes-format]");
const notesTitleInput = document.querySelector("#notes-title");
const notesContentInput = document.querySelector("#notes-content");
const notesSaveStatus = document.querySelector("#notes-save-status");
const notesEditModeButton = document.querySelector("#notes-edit-mode");
const notesPreviewModeButton = document.querySelector("#notes-preview-mode");
const notesPreview = document.querySelector("#notes-preview");
const notesPreviewStatus = document.querySelector("#notes-preview-status");
const notesEditorMode = document.querySelector("#notes-editor-mode");
const notesVimSearch = document.querySelector("#notes-vim-search");
const notesVimSearchInput = document.querySelector("#notes-vim-search-input");
const notesNeovimToggle = document.querySelector("#notes-neovim-toggle");
const notesBlockCaret = document.querySelector("#notes-block-caret");
const notesHelp = document.querySelector("#notes-help");
const commandPalette = document.querySelector("#command-palette");
const commandPaletteSearch = document.querySelector("#command-palette-search");
const notesSearchCaret = document.querySelector("#notes-search-caret");
const commandPaletteResults = document.querySelector("#command-palette-results");
const openCommandPaletteButton = document.querySelector("#open-command-palette");
const openHotkeysButton = document.querySelector("#open-hotkeys");
const hotkeysDialog = document.querySelector("#hotkeys-dialog");
const closeHotkeysButton = document.querySelector("#close-hotkeys");
const colorInput = document.querySelector("#brush-color");
const sizeInput = document.querySelector("#brush-size");
const sizeOutput = document.querySelector("#brush-size-value");
const opacityInput = document.querySelector("#brush-opacity");
const opacityOutput = document.querySelector("#brush-opacity-value");
const toolSettingsPopover = document.querySelector("#tool-settings-popover");
const toolSettingsTitle = document.querySelector("#tool-settings-title");
const toolSettingsType = document.querySelector("#tool-settings-type");
const toolSettingsTypeLabel = document.querySelector("#tool-settings-type-label");
const clearButton = document.querySelector("#clear-canvas");
const clearDialog = document.querySelector("#clear-dialog");
const clearCancelButton = document.querySelector("#cancel-clear");
const clearConfirmButton = document.querySelector("#confirm-clear");
const clearEffectButtons = document.querySelectorAll("[data-clear-effect]");
const rememberClearEffectInput = document.querySelector("#remember-clear-effect");
const addTextButton = document.querySelector("#add-text");
const addImageButton = document.querySelector("#add-image");
const imageFileInput = document.querySelector("#image-file");
const addLayerButton = document.querySelector("#add-layer");
const saveLayerAssetsButton = document.querySelector("#save-layer-assets");
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
const shapeStrokeEnabledInput = document.querySelector("#shape-stroke-enabled");
const shapeFillColorInput = document.querySelector("#shape-fill-color");
const shapeOutlineColorInput = document.querySelector("#shape-outline-color");
const shapeOutlineWidthInput = document.querySelector("#shape-outline-width");
const shapeOutlineWidthValue = document.querySelector("#shape-outline-width-value");
const cancelShapePropertiesButton = document.querySelector("#cancel-shape-properties");
const textForm = document.querySelector("#text-form");
const textDialogTitle = document.querySelector("#text-dialog-title");
const textContent = document.querySelector("#text-content");
const textColor = document.querySelector("#text-color");
const textSize = document.querySelector("#text-size");
const cancelTextButton = document.querySelector("#cancel-text");
const status = document.querySelector("#drawing-status");
const galleryScreen = document.querySelector("#gallery-screen");
const workspaceScreen = document.querySelector("#workspace-screen");
const projectGrid = document.querySelector("#project-grid");
const savedNotesGrid = document.querySelector("#saved-notes-grid");
const savedNotesCount = document.querySelector("#saved-notes-count");
const savedNoteDialog = document.querySelector("#saved-note-dialog");
const savedNoteDialogTitle = document.querySelector("#saved-note-dialog-title");
const savedNoteDialogBody = document.querySelector("#saved-note-dialog-body");
const savedNoteDialogClose = document.querySelector("#saved-note-dialog-close");
const projectSearch = document.querySelector("#project-search");
const newProjectButton = document.querySelector("#new-project-button");
const galleryThemeButton = document.querySelector("#gallery-theme-toggle");
const notesCrtThemeToggle = document.querySelector("#notes-crt-theme-toggle");
const gridViewButton = document.querySelector("#project-grid-view");
const listViewButton = document.querySelector("#project-list-view");
const newProjectDialog = document.querySelector("#new-project-dialog");
const newProjectForm = document.querySelector("#new-project-form");
const newProjectName = document.querySelector("#new-project-name");
const newProjectWidth = document.querySelector("#new-project-width");
const newProjectHeight = document.querySelector("#new-project-height");
const newProjectBackground = document.querySelector("#new-project-background");
const infinitePresetButton = document.querySelector('[data-canvas-preset="infinite"]');
const customBackgroundButton = document.querySelector("#new-project-custom-background");
const customBackgroundPopover = document.querySelector("#new-project-background-popover");
const customBackgroundChip = document.querySelector("#new-project-background-chip");
const backgroundPresetButtons = document.querySelectorAll("[data-background-preset]");
const cancelNewProject = document.querySelector("#cancel-new-project");
const backToGalleryButton = document.querySelector("#back-to-gallery");
const canvasDocumentTitle = document.querySelector("#canvas-document-title");

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("The drawing canvas element could not be found.");
}

function openShapePropertiesDialog(item) {
  if (item?.type !== "shape" || item.locked) return;
  editingShapeId = item.id;
  shapeFillEnabledInput.checked = item.fill === true;
  shapeStrokeEnabledInput.checked = item.stroke !== false;
  shapeOutlineWidthInput.value = String(item.strokeWidth ?? 3);
  shapeOutlineWidthValue.value = `${shapeOutlineWidthInput.value} px`;
  shapeOutlineWidthValue.textContent = shapeOutlineWidthValue.value;
  colorPickerBindings.get("shape-fill-color")?.setColor(item.fillColor ?? item.color);
  document.querySelector("#shape-fill-color-chip").classList.toggle("is-empty", item.fill !== true);
  document.querySelector("#shape-fill-color-trigger").setAttribute("aria-label",
    item.fill ? `Choose shape fill colour, current ${item.fillColor ?? item.color}` : "Shape fill colour: none");
  colorPickerBindings.get("shape-outline-color")?.setColor(item.color ?? colorInput.value);
  updateShapeStyleToggleAvailability();
  shapePropertiesDialog.showModal();
}

function updateShapeStyleToggleAvailability() {
  document.querySelector("#shape-fill-color-trigger").disabled = !shapeFillEnabledInput.checked;
  document.querySelector("#shape-outline-color-trigger").disabled = !shapeStrokeEnabledInput.checked;
  shapeOutlineWidthInput.disabled = !shapeStrokeEnabledInput.checked;
}

function updateBrushTool() {
  const [kind, label, icon] = brushKinds.find(([value]) => value === brushKindInput.value) ?? brushKinds[0];
  brushButton.querySelector("svg").replaceWith(iconSvg(icon, "selected-brush-icon"));
  selectedBrushName.textContent = "Brush";
  brushButton.setAttribute("aria-label", "Brush tool");
  brushButton.title = "Brush";
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

openHotkeysButton.addEventListener("click", () => hotkeysDialog.showModal());
closeHotkeysButton.addEventListener("click", () => hotkeysDialog.close());
hotkeysDialog.addEventListener("click", (event) => {
  if (event.target === hotkeysDialog) hotkeysDialog.close();
});
workspaceActionsMenu.addEventListener("click", (event) => {
  if (event.target.closest("#save-scene")) return;
  workspaceActionsMenu.hidden = true;
  workspaceActionsToggle.setAttribute("aria-expanded", "false");
});

const requiredElements = [
  selectButton, shapesButton, fillButton, brushButton, eraserButton, brushKindInput,
  fillOptionsPopover, workspaceActionsToggle, workspaceActionsMenu,
  shapeDialog, shapeOptions, shapeFillInput, shapeStrokeInput, aboutDialog, aboutButton,
  homeAboutButton, aboutSignalCanvas, closeAboutButton,
  polygonSidesControl, polygonSidesInput, polygonSidesValue, objectContextMenu,
  themeButton, fullscreenButton, zoomLevel, themeColorMeta, sidebarToggle, assetsToggle,
  panelSidebarToggle, editorPanel, assetsPanelView, layersPanelView, railModifierLabel,
  notesToggle, notesPanel, notesSaveButton, notesSaveMenu, savedNotesToggle,
  savedNotesPopover, savedNotesList, notesTitleInput, notesContentInput,
  notesSaveStatus, notesEditModeButton, notesPreviewModeButton, notesPreview,
  notesPreviewStatus, notesEditorMode, notesNeovimToggle, notesBlockCaret, notesHelp,
  notesVimSearch, notesVimSearchInput,
  commandPalette, commandPaletteSearch, notesSearchCaret,
  commandPaletteResults, openCommandPaletteButton,
  openHotkeysButton, hotkeysDialog, closeHotkeysButton, rememberClearEffectInput,
  clearConfirmButton, notesCrtThemeToggle,
  colorInput, sizeInput, sizeOutput, opacityInput, opacityOutput, toolSettingsPopover, toolSettingsTitle, toolSettingsType,
  toolSettingsTypeLabel, clearButton, clearDialog, clearCancelButton,
  addTextButton, addImageButton, imageFileInput, addLayerButton, saveLayerAssetsButton, layerList,
  addCollectionButton, collectionList, assetList, assetCount, assetSearch,
  assetSelectAllButton, assetSelectionCount, assetAddSelectedButton, assetDeleteSelectedButton,
  canvasDimensions, canvasZoom, assetFilterToggle, assetFilters, brushKindControl,
  selectedShapeIcon, selectedShapeName, selectedBrushIcon, selectedBrushName,
  brushKindOptions, textEntry, collectionDialogTitle, layerDialog, layerForm,
  layerNameInput, layerVisibleInput, layerLockedInput, layerOpacityInput, layerOpacityValue,
  layerDeleteButton, cancelLayerButton,
  shapePropertiesDialog, shapePropertiesForm, shapeFillEnabledInput, shapeStrokeEnabledInput,
  shapeFillColorInput,
  shapeOutlineColorInput, cancelShapePropertiesButton,
  saveSceneButton, saveMenu, openSceneButton, sceneFileInput,
  undoButton, redoButton, transparentButton, collapseAllPanesButton,
  selectionControls, selectionLabel, editSelectedTextButton,
  deleteSelectedButton, textDialog, textForm, textDialogTitle, textContent, textColor,
  textSize, cancelTextButton, collectionDialog, collectionForm, collectionNameInput,
  cancelCollectionButton, status, galleryScreen, workspaceScreen, projectGrid, projectSearch,
  newProjectButton, galleryThemeButton, gridViewButton, listViewButton, newProjectDialog,
  newProjectForm, newProjectName, newProjectWidth, newProjectHeight, newProjectBackground,
  ...notesFormatButtons, ...clearEffectButtons, ...backgroundPresetButtons,
  cancelNewProject, backToGalleryButton, canvasDocumentTitle,
  savedNotesGrid, savedNotesCount, savedNoteDialog, savedNoteDialogTitle,
  savedNoteDialogBody, savedNoteDialogClose, infinitePresetButton,
  customBackgroundButton,
  customBackgroundPopover, customBackgroundChip,
];

const brushKinds = [
  ["ink", "Ink", "M4 20c4.5 0 6.2-1.8 7-4.2l7.9-7.9a2.1 2.1 0 0 0-3-3L8 12.8C5.8 13.6 4 15.5 4 20Z"],
  ["crayon", "Crayon", "m5 16 9-11 5 4-9 12H5v-5Zm8-9 5 4M5 16l5 5"],
  ["airbrush", "Airbrush", "M4 18h10l6-6-4-4-6 6H4v4Zm12-12 1-2m3 4 2-1m-7-4 1-2"],
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
if (requiredElements.some((element) => !element) || workspacePanelTabs.length !== 2) {
  throw new Error("One or more drawing, library, or workspace panel controls could not be found.");
}

document.body.append(toolSettingsPopover);
document.body.append(notesBlockCaret);

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
let activeProjectId = null;
let activeProjectName = "Untitled artwork";
let activeProjectDimensions = { width: 2048, height: 2048 };
let activeProjectThumbnail = null;
let selectedCanvasBackground = "white";
let notesMode = "edit";
let notesRevision = 0;
let notesDirty = false;
let markdownParser = null;
let vimModeEnabled = false;
let vimEditorMode = "insert";
let vimCrtTheme = "green";
let vimDeletePending = false;
let vimChangePending = false;
let vimReplacePending = false;
let vimGoPending = false;
let vimYankLine = "";
let vimYankPending = false;
let vimSearchQuery = "";
let notesLastValue = "";
let notesUndoStack = [];
let notesRedoStack = [];
let galleryLayout = "grid";
let activeWorkspacePanel = "layers";
let activeProjectInfinite = false;
let newProjectInfinite = false;
let savedNoteRecords = [];
let pendingSaveNoteId = null;
let noteSearchPending = false;
let clearActivationTimer = null;

const shapes = [
  ["circle", "Circle"], ["oval", "Oval / Ellipse"], ["square", "Square"], ["rectangle", "Rectangle"],
  ["triangle", "Triangle"], ["star", "Star"],
  ["heart", "Heart"], ["arrow", "Arrow"], ["line", "Line"], ["curve", "Curve"], ["arc", "Arc"],
  ["polygon", "Polygon"], ["rounded-rectangle", "Rounded Rectangle"],
  ["speech-bubble", "Speech Bubble"], ["spiral", "Spiral"],
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
  shapesButton.title = label;
}

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function announceError(action, error) {
  const detail = error instanceof Error ? error.message : "Unknown error.";
  status.textContent = `${action}: ${detail}`;
  console.error(action, error);
}

function setGalleryVisible(visible) {
  galleryScreen.hidden = !visible;
  workspaceScreen.hidden = visible;
  document.querySelector(".app-shell").classList.toggle("is-gallery", visible);
  workspaceActionsMenu.hidden = true;
  workspaceActionsToggle.setAttribute("aria-expanded", "false");
  if (!visible) {
    document.querySelector(".app-shell").classList.toggle("is-infinite", activeProjectInfinite);
    canvasDocumentTitle.textContent = activeProjectName;
    document.title = `GOOF — ${activeProjectName}`;
    requestAnimationFrame(() => {
      applyCanvasAspectRatio();
      drawing.resize();
      updateCanvasStatus();
    });
  } else {
    document.title = "GOOF Studio — Artwork gallery";
  }
}

function applyCanvasAspectRatio() {
  const frame = document.querySelector(".canvas-frame");
  const container = document.querySelector(".canvas-container");
  if (!frame || !container || workspaceScreen.hidden) return;
  const frameStyle = getComputedStyle(frame);
  const availableWidth = Math.max(0, frame.clientWidth -
    Number.parseFloat(frameStyle.paddingLeft) - Number.parseFloat(frameStyle.paddingRight));
  const availableHeight = Math.max(0, frame.clientHeight -
    Number.parseFloat(frameStyle.paddingTop) - Number.parseFloat(frameStyle.paddingBottom));
  if (!availableWidth || !availableHeight) return;
  if (activeProjectInfinite) {
    container.style.width = `${availableWidth}px`;
    container.style.height = `${availableHeight}px`;
    container.style.flex = "1 1 auto";
    container.style.margin = "0";
    container.style.transform = "";
    aboutButton.style.top = "auto";
    aboutButton.style.bottom = "8px";
    return;
  }
  const ratio = activeProjectDimensions.width / activeProjectDimensions.height;
  const width = Math.min(availableWidth, availableHeight * ratio);
  const height = width / ratio;
  const verticalSpace = Math.max(0, availableHeight - height);
  const topGap = Math.min(
    window.matchMedia("(max-width: 767px)").matches ? 24 : 0,
    verticalSpace / 2,
  );
  const verticalShift = verticalSpace / 2 - topGap;
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.flex = "0 1 auto";
  container.style.margin = "auto";
  container.style.transform = verticalShift > 0 ? `translateY(${-verticalShift}px)` : "";
  aboutButton.style.top = `${Number.parseFloat(frameStyle.paddingTop) + topGap + height + 4}px`;
  aboutButton.style.bottom = "auto";
}

let canvasResizeFrame = 0;
function scheduleCanvasResize() {
  if (workspaceScreen.hidden || canvasResizeFrame) return;
  canvasResizeFrame = requestAnimationFrame(() => {
    canvasResizeFrame = 0;
    if (workspaceScreen.hidden) return;
    applyCanvasAspectRatio();
    drawing.resize();
  });
}
for (const button of backgroundPresetButtons) {
  button.addEventListener("click", () => updateBackgroundPreset(button.dataset.backgroundPreset));
}
newProjectBackground.addEventListener("input", () => updateBackgroundPreset("custom"));

const canvasFrameResizeObserver = new ResizeObserver(scheduleCanvasResize);
canvasFrameResizeObserver.observe(document.querySelector(".canvas-frame"));
window.addEventListener("resize", scheduleCanvasResize);
document.addEventListener("fullscreenchange", scheduleCanvasResize);

function getProjectImageAssets(state = drawing.getState()) {
  const imageIds = new Set(state.layers.flatMap((layer) =>
    layer.items.filter((item) => item.type === "image").map((item) => item.assetId)));
  return [...imageIds].map((id) => drawing.imageAssets.get(id)).filter(Boolean);
}

function getProjectNotes() {
  return {
    title: notesTitleInput.value.slice(0, 100),
    content: notesContentInput.value.slice(0, 100000),
  };
}

function restoreProjectNotes(notes) {
  const valid = notes === undefined || notes === null ||
    (typeof notes === "object" && !Array.isArray(notes) &&
      (notes.title === undefined || typeof notes.title === "string") &&
      (notes.content === undefined || typeof notes.content === "string"));
  if (!valid) {
    console.warn("Artwork note data was invalid; the drawing will open with a blank note.");
  }
  notesTitleInput.value = valid ? (notes?.title ?? "").slice(0, 100) : "";
  notesContentInput.value = valid ? (notes?.content ?? "").slice(0, 100000) : "";
  notesLastValue = notesContentInput.value;
  notesUndoStack = [];
  notesRedoStack = [];
  notesRevision += 1;
  notesDirty = false;
  notesSaveStatus.textContent = valid ? "Saved" : "Invalid note data; using a blank note";
  if (notesMode === "preview") renderNotesPreview();
  return valid;
}

function setNotesVisible(visible) {
  notesPanel.hidden = !visible;
  notesPanel.inert = !visible;
  notesToggle.setAttribute("aria-expanded", String(visible));
  notesSaveMenu.hidden = true;
  savedNotesPopover.hidden = true;
  notesSaveButton.setAttribute("aria-expanded", "false");
  savedNotesToggle.setAttribute("aria-expanded", "false");
  if (visible) {
    setNotesMode("edit");
    notesContentInput.focus();
  } else {
    notesBlockCaret.hidden = true;
  }
}

function dismissNotesForTool() {
  if (!notesPanel.hidden) setNotesVisible(false);
}

function setNotesMode(mode) {
  if (mode !== "edit" && mode !== "preview") {
    throw new Error(`Unknown notes mode: ${mode}`);
  }
  notesMode = mode;
  const editing = mode === "edit";
  notesEditModeButton.classList.toggle("is-active", editing);
  notesEditModeButton.setAttribute("aria-pressed", String(editing));
  notesPreviewModeButton.classList.toggle("is-active", !editing);
  notesPreviewModeButton.setAttribute("aria-pressed", String(!editing));
  notesContentInput.hidden = !editing;
  notesPreview.hidden = editing;
  if (editing) updateVimEditorMode("insert");
  else {
    notesEditorMode.hidden = true;
    notesBlockCaret.hidden = true;
    notesVimSearch.hidden = true;
  }
  if (!editing) renderNotesPreview();
}

function toggleNotesEditPreview() {
  const editing = notesMode !== "edit";
  setNotesMode(editing ? "edit" : "preview");
  if (editing) notesContentInput.focus();
  else notesPreviewModeButton.focus();
}

function openVimSearch() {
  notesVimSearch.hidden = false;
  notesVimSearchInput.value = vimSearchQuery;
  notesVimSearchInput.focus();
  notesVimSearchInput.select();
}

function findVimSearchMatch(backwards = false) {
  const query = notesVimSearchInput.value || vimSearchQuery;
  if (!query) return false;
  vimSearchQuery = query;
  const text = notesContentInput.value.toLocaleLowerCase();
  const needle = query.toLocaleLowerCase();
  const start = notesContentInput.selectionStart;
  const index = backwards
    ? (text.lastIndexOf(needle, Math.max(0, start - 1)) >= 0
      ? text.lastIndexOf(needle, Math.max(0, start - 1))
      : text.lastIndexOf(needle))
    : (text.indexOf(needle, notesContentInput.selectionEnd) >= 0
      ? text.indexOf(needle, notesContentInput.selectionEnd)
      : text.indexOf(needle));
  if (index < 0) {
    status.textContent = `No match for “${query}”.`;
    return false;
  }
  notesContentInput.setSelectionRange(index, index + query.length);
  notesVimSearch.hidden = true;
  notesContentInput.focus();
  updateNotesBlockCaret();
  return true;
}

notesVimSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    notesVimSearch.hidden = true;
    notesContentInput.focus();
    updateNotesBlockCaret();
  } else if (event.key === "Enter") {
    event.preventDefault();
    findVimSearchMatch(event.shiftKey);
  }
});

function safeNoteLink(href) {
  const value = href.trim();
  if (!value || value.startsWith("//") || /[\u0000-\u001f]/.test(value)) return null;
  try {
    const url = new URL(value, window.location.href);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? value : null;
  } catch {
    return null;
  }
}

function appendNoteInlineNodes(parent, nodes) {
  if (!Array.isArray(nodes)) return;
  for (const node of nodes) {
    if (!node || typeof node !== "object") continue;
    if (node.type === "text" || node.type === "code") {
      if (typeof node.text !== "string") continue;
      const element = node.type === "code" ? document.createElement("code") : null;
      if (element) {
        element.textContent = node.text;
        parent.append(element);
      } else {
        parent.append(document.createTextNode(node.text));
      }
    } else if (node.type === "emphasis" || node.type === "strong") {
      const element = document.createElement(node.type === "strong" ? "strong" : "em");
      appendNoteInlineNodes(element, node.children);
      parent.append(element);
    } else if (node.type === "link") {
      const safeHref = typeof node.href === "string" ? safeNoteLink(node.href) : null;
      if (!safeHref) {
        appendNoteInlineNodes(parent, node.children);
        continue;
      }
      const link = document.createElement("a");
      link.href = safeHref;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      appendNoteInlineNodes(link, node.children);
      parent.append(link);
    }
  }
}

function parseNotesInlineFallback(text) {
  const nodes = [];
  const tokenPattern = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`\n]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  for (const match of text.matchAll(tokenPattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push({ type: "text", text: text.slice(lastIndex, index) });
    const token = match[0];
    if (token.startsWith("**") || token.startsWith("__")) {
      nodes.push({ type: "strong", children: [{ type: "text", text: token.slice(2, -2) }] });
    } else if (token.startsWith("*") || token.startsWith("_")) {
      nodes.push({ type: "emphasis", children: [{ type: "text", text: token.slice(1, -1) }] });
    } else if (token.startsWith("`")) {
      nodes.push({ type: "code", text: token.slice(1, -1) });
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) nodes.push({ type: "link", href: link[2], children: [{ type: "text", text: link[1] }] });
    }
    lastIndex = index + token.length;
  }
  if (lastIndex < text.length) nodes.push({ type: "text", text: text.slice(lastIndex) });
  return nodes;
}

function parseNotesMarkdownFallback(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }
    if (line.startsWith("```")) {
      index += 1;
      const code = [];
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ type: "code_block", text: code.join("\n") });
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, children: parseNotesInlineFallback(heading[2]) });
      index += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      const quote = [];
      while (index < lines.length && lines[index].trim().startsWith("> ")) {
        quote.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push({ type: "quote", children: parseNotesInlineFallback(quote.join(" ")) });
      continue;
    }
    const listMatch = line.match(/^(?:([-*+])\s+|(\d+)\.\s+)(.*)$/);
    if (listMatch) {
      const ordered = Boolean(listMatch[2]);
      const items = [parseNotesInlineFallback(listMatch[3])];
      index += 1;
      while (index < lines.length) {
        const next = lines[index].trim().match(/^(?:([-*+])\s+|(\d+)\.\s+)(.*)$/);
        if (!next || Boolean(next[2]) !== ordered) break;
        items.push(parseNotesInlineFallback(next[3]));
        index += 1;
      }
      blocks.push({ type: ordered ? "ordered_list" : "unordered_list", items });
      continue;
    }
    const paragraph = [line];
    index += 1;
    while (index < lines.length) {
      const next = lines[index].trim();
      if (!next || next.startsWith("```") || /^(#{1,6})\s+/.test(next) ||
          next.startsWith("> ") || /^(?:[-*+]\s+|\d+\.\s+)/.test(next)) break;
      paragraph.push(next);
      index += 1;
    }
    blocks.push({ type: "paragraph", children: parseNotesInlineFallback(paragraph.join(" ")) });
  }
  return blocks;
}

function renderNotesPreview() {
  notesPreview.replaceChildren();
  notesPreview.classList.remove("is-plain-text");
  if (notesTitleInput.value.trim()) {
    const title = document.createElement("h2");
    title.textContent = notesTitleInput.value.trim();
    notesPreview.append(title);
  }
  if (!notesContentInput.value) {
    const empty = document.createElement("p");
    empty.textContent = "Nothing to preview yet.";
    notesPreview.append(empty);
    notesPreviewStatus.textContent = "";
    return;
  }
  try {
    const blocks = markdownParser
      ? JSON.parse(markdownParser(notesContentInput.value))
      : parseNotesMarkdownFallback(notesContentInput.value);
    if (!Array.isArray(blocks)) throw new Error("The Notes parser returned an invalid document.");
    for (const block of blocks) {
      if (!block || typeof block !== "object") continue;
      let element;
      if (block.type === "heading" && Number.isInteger(block.level) && block.level >= 1 && block.level <= 6) {
        element = document.createElement(`h${block.level}`);
        appendNoteInlineNodes(element, block.children);
      } else if (block.type === "paragraph" || block.type === "quote") {
        element = document.createElement(block.type === "quote" ? "blockquote" : "p");
        appendNoteInlineNodes(element, block.children);
      } else if (block.type === "unordered_list" || block.type === "ordered_list") {
        element = document.createElement(block.type === "ordered_list" ? "ol" : "ul");
        if (Array.isArray(block.items)) {
          for (const item of block.items) {
            const listItem = document.createElement("li");
            appendNoteInlineNodes(listItem, item);
            element.append(listItem);
          }
        }
      } else if (block.type === "code_block" && typeof block.text === "string") {
        element = document.createElement("pre");
        const code = document.createElement("code");
        code.textContent = block.text;
        element.append(code);
      } else {
        continue;
      }
      notesPreview.append(element);
    }
    notesPreviewStatus.textContent = markdownParser ? "" : "Using the built-in Markdown preview.";
  } catch (error) {
    console.error("Could not render the Notes preview.", error);
    const plainText = document.createElement("p");
    plainText.textContent = notesContentInput.value;
    notesPreview.append(plainText);
    notesPreviewStatus.textContent = "Preview could not be rendered; showing plain text.";
  }
}

async function persistActiveProject(captureThumbnail = false) {
  if (!activeProjectId || restoringAutosave) return;
  const savedNotesRevision = notesRevision;
  const state = drawing.getState();
  let thumbnail = activeProjectThumbnail;
  if (captureThumbnail) {
    try {
      const preview = document.createElement("canvas");
      preview.width = 480;
      preview.height = 336;
      const context = preview.getContext("2d");
      if (!context) throw new Error("A thumbnail canvas context is unavailable.");
      context.fillStyle = "#292a2e";
      context.fillRect(0, 0, preview.width, preview.height);
      const scale = Math.min(preview.width / canvas.width, preview.height / canvas.height);
      const width = canvas.width * scale;
      const height = canvas.height * scale;
      context.drawImage(canvas, (preview.width - width) / 2, (preview.height - height) / 2, width, height);
      thumbnail = preview.toDataURL("image/jpeg", 0.76);
      activeProjectThumbnail = thumbnail;
    } catch (error) {
      console.warn("Artwork was saved without a thumbnail.", error);
      thumbnail = null;
      activeProjectThumbnail = null;
    }
  }
  await saveProject({
    id: activeProjectId,
    name: activeProjectName,
    updatedAt: Date.now(),
    width: activeProjectDimensions.width,
    height: activeProjectDimensions.height,
    infiniteCanvas: activeProjectInfinite,
    thumbnail,
    state,
    assets: getProjectImageAssets(state),
    notes: getProjectNotes(),
  });
  if (notesDirty && savedNotesRevision === notesRevision) {
    notesDirty = false;
    notesSaveStatus.textContent = "Saved";
  }
}

async function saveActiveProject(captureThumbnail = true) {
  if (!activeProjectId) {
    activeProjectId = createId("project");
  }
  await persistActiveProject(captureThumbnail);
  await renderProjectGallery();
  status.textContent = activeProjectThumbnail
    ? `Saved “${activeProjectName}” on this device.`
    : `Saved “${activeProjectName}” on this device; its preview is unavailable for this artwork.`;
}

function formatProjectDate(timestamp) {
  if (!Number.isFinite(timestamp)) return "Not saved yet";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(timestamp);
}

async function renderProjectGallery() {
  const allProjects = await listProjects();
  void renderSavedNotes(allProjects).catch((error) => {
    announceError("Could not load saved notes", error);
  });
  const projects = allProjects.filter((project) => project.id !== "goof-autosave");
  const query = projectSearch.value.trim().toLocaleLowerCase();
  const filtered = projects.filter((project) => project.name.toLocaleLowerCase().includes(query));
  projectGrid.replaceChildren();
  galleryScreen.classList.toggle("is-list", galleryLayout === "list");

  for (const project of filtered) {
    const card = document.createElement("article");
    card.className = "project-card";
    const preview = document.createElement("button");
    preview.className = "project-preview";
    preview.type = "button";
    preview.setAttribute("aria-label", `Open ${project.name}`);
    if (typeof project.thumbnail === "string" && project.thumbnail.startsWith("data:image/")) {
      const image = document.createElement("img");
      image.src = project.thumbnail;
      image.alt = "";
      preview.append(image);
    } else {
      const placeholder = document.createElement("span");
      placeholder.className = "project-preview-placeholder";
      placeholder.style.setProperty("--art-accent", "#9b8cff");
      preview.append(placeholder);
    }
    preview.addEventListener("click", () => void openProject(project));

    const body = document.createElement("div");
    body.className = "project-card-body";
    const info = document.createElement("div");
    const title = document.createElement("h2");
    title.className = "project-title";
    title.textContent = project.name;
    const metadata = document.createElement("p");
    metadata.className = "project-metadata";
    metadata.textContent = `${project.width ?? 2048} × ${project.height ?? 2048} · ${formatProjectDate(project.updatedAt)}`;
    info.append(title, metadata);
    const actions = document.createElement("div");
    actions.className = "project-card-actions";
    const open = createProjectAction("open", `Open ${project.name}`, "M5 12h14m-7-7 7 7-7 7");
    open.addEventListener("click", () => void openProject(project));
    const rename = createProjectAction("rename", `Rename ${project.name}`, "M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z");
    rename.addEventListener("click", () => void renameProject(project));
    const duplicate = createProjectAction("duplicate", `Duplicate ${project.name}`, "M8 8h12v12H8zM16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3");
    duplicate.addEventListener("click", () => void duplicateProject(project));
    const remove = createProjectAction("delete", `Delete ${project.name}`, "M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3");
    remove.addEventListener("click", () => void removeProject(project));
    actions.append(open, rename, duplicate, remove);
    body.append(info, actions);
    card.append(preview, body);
    projectGrid.append(card);
  }

  if (!projectGrid.children.length) {
    const empty = document.createElement("div");
    empty.className = "project-empty-state";
    const heading = document.createElement("strong");
    heading.textContent = query ? "No matching artwork" : "Your canvas is waiting";
    const message = document.createElement("span");
    message.textContent = query ? "Try another title." : "Create a canvas and start making something yours.";
    empty.append(heading, message);
    if (!query) {
      const create = document.createElement("button");
      create.className = "gallery-new-button";
      create.type = "button";
      create.textContent = "Create your first artwork";
      create.addEventListener("click", openNewProjectDialog);
      empty.append(create);
    }
    projectGrid.append(empty);
  }
}

function createProjectAction(action, label, path) {
  const button = document.createElement("button");
  button.className = "project-action";
  button.type = "button";
  button.dataset.action = action;
  button.setAttribute("aria-label", label);
  button.title = label;
  button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
  return button;
}

async function openProject(project, isRecovery = false) {
  try {
    if (!project?.state?.layers?.length) throw new Error("This artwork has no valid layer data.");
    restoringAutosave = true;
    drawing.setImageAssets([...assets.filter((asset) => !asset.assetKind), ...(project.assets ?? [])]);
    drawing.loadState(project.state);
    activeProjectId = isRecovery ? null : project.id;
    activeProjectName = isRecovery ? "Recovered artwork" : project.name;
    activeProjectDimensions = {
      width: Math.max(256, Math.min(8192, Number(project.width) || 2048)),
      height: Math.max(256, Math.min(8192, Number(project.height) || 2048)),
    };
    activeProjectInfinite = project.infiniteCanvas === true || project.state.infiniteCanvas === true;
    if (drawing.infiniteCanvas !== activeProjectInfinite) {
      drawing.setInfiniteCanvas(activeProjectInfinite);
    }
    activeProjectThumbnail = isRecovery ? null : project.thumbnail ?? null;
    const validNotes = restoreProjectNotes(project.notes);
    const transparentButton = document.querySelector("#toggle-transparent");
    transparentButton.setAttribute("aria-pressed", String(drawing.transparentCanvas));
    setGalleryVisible(false);
    status.textContent = validNotes
      ? `Opened “${activeProjectName}”.`
      : `Opened “${activeProjectName}” with a blank note because its saved note data was invalid.`;
    setNotesVisible(false);
  } catch (error) {
    announceError("Could not open this artwork", error);
  } finally {
    restoringAutosave = false;
  }
}

function updateBackgroundPreset(preset) {
  selectedCanvasBackground = preset;
  if (preset === "black") newProjectBackground.value = "#000000";
  else if (preset === "white") newProjectBackground.value = "#ffffff";
  customBackgroundButton.style.setProperty("--custom-background", newProjectBackground.value);
  customBackgroundChip.style.backgroundColor = newProjectBackground.value;
  for (const button of backgroundPresetButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.backgroundPreset === preset));
  }
  customBackgroundButton.setAttribute("aria-pressed", String(preset === "custom"));
}

function openNewProjectDialog() {
  newProjectName.value = "Untitled artwork";
  newProjectInfinite = false;
  infinitePresetButton.setAttribute("aria-pressed", "false");
  newProjectWidth.disabled = false;
  newProjectHeight.disabled = false;
  updateBackgroundPreset("white");
  newProjectDialog.showModal();
  newProjectName.focus();
  newProjectName.select();
}

async function renameProject(project) {
  const name = window.prompt("Rename artwork", project.name);
  if (name === null) return;
  const trimmed = name.trim();
  if (!trimmed) {
    status.textContent = "An artwork name cannot be empty.";
    return;
  }
  await saveProject({ ...project, name: trimmed, updatedAt: Date.now() });
  if (activeProjectId === project.id) {
    activeProjectName = trimmed;
    canvasDocumentTitle.textContent = trimmed;
  }
  await renderProjectGallery();
}

async function duplicateProject(project) {
  await saveProject({
    ...structuredClone(project),
    id: createId("project"),
    name: `${project.name} copy`,
    updatedAt: Date.now(),
  });
  await renderProjectGallery();
  status.textContent = `Duplicated “${project.name}”.`;
}

async function removeProject(project) {
  if (!window.confirm(`Delete “${project.name}” from this device? This cannot be undone.`)) return;
  await deleteProject(project.id);
  if (activeProjectId === project.id) activeProjectId = null;
  await renderProjectGallery();
}

function selectTool(tool) {
  dismissNotesForTool();
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
  railModifierLabel.textContent = toolName;
  status.textContent = `${toolName} tool selected.`;
}

function openToolSettings(tool) {
  if (tool !== "brush" && tool !== "eraser") return;
  selectTool(tool);
  toolSettingsTitle.textContent = tool === "brush" ? "Brush library" : "Eraser settings";
  toolSettingsPopover.setAttribute("aria-label", tool === "brush" ? "Brush library" : "Eraser settings");
  toolSettingsTypeLabel.textContent = "Tip";
  brushKindControl.hidden = tool !== "brush";
  toolSettingsType.hidden = false;
  toolSettingsType.value = toolTypes[tool];
  const settingsButton = tool === "brush" ? brushButton : eraserButton;
  const bounds = settingsButton.getBoundingClientRect();
  const popupWidth = Math.min(340, window.innerWidth - 24);
  toolSettingsPopover.style.position = "fixed";
  toolSettingsPopover.style.width = `${popupWidth}px`;
  toolSettingsPopover.style.left = `${Math.max(12, Math.min(bounds.left, window.innerWidth - popupWidth - 12))}px`;
  toolSettingsPopover.style.top = `${Math.max(12, bounds.bottom + 8)}px`;
  toolSettingsPopover.style.right = "auto";
  toolSettingsPopover.hidden = false;
  brushButton.setAttribute("aria-expanded", String(tool === "brush"));
  brushKindOptions.querySelector("button")?.focus();
}

function setTheme(theme, persist = true) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  themeColorMeta.content = isDark ? "#111214" : "#eff0f2";
  themeButton.setAttribute("aria-pressed", String(isDark));
  const label = `Switch to ${isDark ? "light" : "dark"} mode`;
  themeButton.setAttribute("aria-label", label);
  themeButton.title = label;
  galleryThemeButton.setAttribute("aria-pressed", String(isDark));
  galleryThemeButton.setAttribute("aria-label", label);
  galleryThemeButton.title = label;
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
    : "dark";
  setTheme(initialTheme, false);
} catch (error) {
  announceError("Could not read the theme preference", error);
  setTheme("dark", false);
}

try {
  const savedCrtTheme = localStorage.getItem("goof-notes-crt-theme");
  if (savedCrtTheme === "amber" || savedCrtTheme === "green") vimCrtTheme = savedCrtTheme;
} catch (error) {
  announceError("Could not read the Notes CRT theme preference", error);
}

function setNotesCrtTheme(theme, persist = true) {
  if (theme !== "amber" && theme !== "green") {
    throw new Error(`Unknown Notes CRT theme: ${theme}`);
  }
  vimCrtTheme = theme;
  notesPanel.dataset.crtTheme = theme;
  const nextTheme = theme === "green" ? "amber" : "green";
  notesCrtThemeToggle.textContent = theme === "green" ? "Green" : "Amber";
  notesCrtThemeToggle.title = `${theme === "green" ? "Green" : "Amber"} CRT theme`;
  notesCrtThemeToggle.setAttribute("aria-label", `Switch CRT theme to ${nextTheme}`);
  if (persist) {
    try {
      localStorage.setItem("goof-notes-crt-theme", theme);
    } catch (error) {
      announceError("Could not save the Notes CRT theme preference", error);
    }
  }
}

setNotesCrtTheme(vimCrtTheme, false);

function updateVimEditorMode(mode) {
  vimEditorMode = mode;
  notesEditorMode.textContent = mode.toUpperCase();
  notesEditorMode.hidden = notesMode !== "edit" || !vimModeEnabled;
  notesContentInput.readOnly = vimModeEnabled && mode === "normal";
  notesContentInput.setAttribute("aria-readonly", String(notesContentInput.readOnly));
  notesContentInput.style.caretColor = vimModeEnabled && mode === "normal" ? "transparent" : "auto";
  requestAnimationFrame(() => requestAnimationFrame(updateNotesBlockCaret));
}

function setNotesNeovimMode(enabled) {
  vimModeEnabled = enabled;
  vimDeletePending = false;
  vimChangePending = false;
  vimReplacePending = false;
  vimGoPending = false;
  vimYankPending = false;
  notesVimSearch.hidden = true;
  notesNeovimToggle.setAttribute("aria-pressed", String(enabled));
  notesNeovimToggle.setAttribute("aria-label", `${enabled ? "Disable" : "Enable"} Notes Vim mode`);
  notesNeovimToggle.title = `${enabled ? "Disable" : "Enable"} Vim mode`;
  notesCrtThemeToggle.hidden = !enabled;
  notesPanel.classList.toggle("is-vim-mode", enabled);
  notesHelp.hidden = !enabled;
  updateVimEditorMode("insert");
  status.textContent = `Notes Vim mode ${enabled ? "enabled" : "disabled"}.`;
  if (enabled) {
    setNotesVisible(true);
    setNotesMode("edit");
    notesContentInput.focus();
  }
}

function updateNotesBlockCaret() {
  if (!vimModeEnabled || notesMode !== "edit" || vimEditorMode !== "normal" ||
      document.activeElement !== notesContentInput) {
    notesBlockCaret.hidden = true;
    return;
  }
  positionBlockCaret(notesContentInput, notesBlockCaret);
}

function positionBlockCaret(editor, caret) {
  const bounds = editor.getBoundingClientRect();
  if (!bounds.width || !bounds.height) {
    caret.hidden = true;
    return;
  }
  const computed = getComputedStyle(editor);
  const isTextarea = editor instanceof HTMLTextAreaElement;
  const mirror = document.createElement("div");
  Object.assign(mirror.style, {
    position: "fixed",
    top: `${bounds.top}px`,
    left: `${bounds.left}px`,
    width: `${bounds.width}px`,
    height: `${bounds.height}px`,
    boxSizing: "border-box",
    overflow: "hidden",
    visibility: "hidden",
    whiteSpace: isTextarea ? "pre-wrap" : "pre",
    overflowWrap: computed.overflowWrap,
    wordBreak: computed.wordBreak,
    font: computed.font,
    lineHeight: computed.lineHeight,
    letterSpacing: computed.letterSpacing,
    wordSpacing: computed.wordSpacing,
    textIndent: computed.textIndent,
    textAlign: computed.textAlign,
    padding: computed.padding,
    border: computed.border,
    tabSize: computed.tabSize,
  });
  const content = editor.value.slice(0, editor.selectionStart);
  const textNode = document.createTextNode(content);
  const marker = document.createElement("span");
  marker.textContent = "\u200b";
  mirror.append(textNode, marker);
  document.body.append(mirror);
  const cursorRect = marker.getBoundingClientRect();
  const lineHeight = Number.parseFloat(computed.lineHeight) || Number.parseFloat(computed.fontSize) || 14;
  const fontSize = Number.parseFloat(computed.fontSize) || 12;
  caret.style.left = `${cursorRect.left - editor.scrollLeft}px`;
  caret.style.top = `${cursorRect.top - editor.scrollTop}px`;
  caret.style.width = `${Math.max(10, fontSize * 0.72)}px`;
  caret.style.height = `${Math.max(fontSize, Math.min(lineHeight, 24))}px`;
  caret.hidden = false;
  mirror.remove();
}

function createLayerThumbnail(layer, items) {
  const thumbnail = document.createElement("canvas");
  thumbnail.className = "layer-thumbnail";
  thumbnail.width = 64;
  thumbnail.height = 40;
  thumbnail.setAttribute("aria-hidden", "true");
  const context = thumbnail.getContext("2d");
  if (!context) throw new Error("A 2D canvas context is unavailable for layer thumbnails.");
  const width = thumbnail.width;
  const height = thumbnail.height;
  const canvasWidth = Math.max(1, drawing.width);
  const canvasHeight = Math.max(1, drawing.height);

  context.save();
  context.globalAlpha = layer.visible ? layer.opacity : 0.24;
  for (const item of items) {
    const x = (item.x ?? 0) * width;
    const y = (item.y ?? 0) * height;
    context.globalAlpha = (layer.visible ? layer.opacity : 0.24) * (item.opacity ?? 1);
    context.globalCompositeOperation = "source-over";
    context.strokeStyle = item.color ?? "#34314a";
    context.fillStyle = item.fillColor ?? item.color ?? "#34314a";
    context.lineWidth = Math.max(1, (item.size ?? item.strokeWidth ?? 3) * width / canvasWidth);
    context.lineCap = "round";
    context.lineJoin = "round";

    if (item.type === "stroke" && Array.isArray(item.points) && item.points.length) {
      context.globalCompositeOperation = item.tool === "eraser" ? "destination-out" : "source-over";
      if (item.points.length === 1) {
        context.arc(item.points[0].x * width, item.points[0].y * height,
          Math.max(1, context.lineWidth / 2), 0, Math.PI * 2);
        context.fill();
      } else {
        context.beginPath();
        item.points.forEach((point, index) => {
          const px = point.x * width;
          const py = point.y * height;
          if (index === 0) context.moveTo(px, py);
          else context.lineTo(px, py);
        });
        context.stroke();
      }
    } else if (item.type === "shape") {
      const boxWidth = Math.max(1, (item.width ?? 0) * width);
      const boxHeight = Math.max(1, (item.height ?? 0) * height);
      if (item.fill && !["line", "curve", "arc", "spiral"].includes(item.shape)) {
        context.fillRect(x, y, boxWidth, boxHeight);
      }
      context.strokeRect(x, y, boxWidth, boxHeight);
    } else if (item.type === "text") {
      context.font = `${Math.max(5, Math.min(9, (item.fontSize ?? 32) * 0.18))}px sans-serif`;
      context.fillText(item.text.slice(0, 30), x, Math.min(height - 2, y + 7), width - x);
    } else if (item.type === "image") {
      context.strokeRect(x, y, Math.max(6, (item.width ?? 0.2) * width), Math.max(5, (item.height ?? 0.2) * height));
      context.beginPath();
      context.moveTo(x + 2, y + 12);
      context.lineTo(x + 12, y + 5);
      context.lineTo(x + 21, y + 13);
      context.stroke();
    }
  }
  context.restore();
  return thumbnail;
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

    const thumbnail = createLayerThumbnail(layer, drawing.getLayerPreviewItems(layer.id));
    thumbnail.title = `Preview of ${layer.name}`;
    row.append(dragHandle, thumbnail, lock, select, visibility, remove);
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
  canvasDimensions.textContent = !workspaceScreen.hidden
    ? `${activeProjectDimensions.width} × ${activeProjectDimensions.height} px`
    : `${Math.round(drawing.width)} × ${Math.round(drawing.height)} px`;
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
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    finishTextEntry();
  } else if (event.key === "Escape") {
    textEntry.value = "";
    textEntry.hidden = true;
  }
});
let textResizeState = null;
function textResizeEdges(event) {
  const bounds = textEntry.getBoundingClientRect();
  const edge = event.pointerType === "touch" ? 22 : 10;
  return {
    left: event.clientX - bounds.left <= edge,
    right: bounds.right - event.clientX <= edge,
    top: event.clientY - bounds.top <= edge,
    bottom: bounds.bottom - event.clientY <= edge,
  };
}
textEntry.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 && event.pointerType !== "touch") return;
  const edges = textResizeEdges(event);
  if (!edges.left && !edges.right && !edges.top && !edges.bottom) return;
  const container = textEntry.parentElement.getBoundingClientRect();
  textResizeState = {
    pointerId: event.pointerId,
    edges,
    x: event.clientX,
    y: event.clientY,
    width: textEntry.getBoundingClientRect().width,
    height: textEntry.getBoundingClientRect().height,
    left: Number.parseFloat(textEntry.style.left),
    top: Number.parseFloat(textEntry.style.top),
    container,
  };
  event.preventDefault();
  event.stopPropagation();
  textEntry.setPointerCapture(event.pointerId);
});
textEntry.addEventListener("pointermove", (event) => {
  if (textResizeState?.pointerId === event.pointerId) {
    const { edges, x, y, width, height, left, top, container } = textResizeState;
    const deltaX = event.clientX - x;
    const deltaY = event.clientY - y;
    const nextWidth = Math.max(88, Math.min(container.width - 16,
      width + (edges.right ? deltaX : edges.left ? -deltaX : 0)));
    const nextHeight = Math.max(44, Math.min(container.height - 16,
      height + (edges.bottom ? deltaY : edges.top ? -deltaY : 0)));
    const canvasBounds = canvas.getBoundingClientRect();
    const centerX = container.left + left + (edges.left || edges.right ? deltaX / 2 : 0);
    const centerY = container.top + top + (edges.top || edges.bottom ? deltaY / 2 : 0);
    textEntry.style.width = `${nextWidth}px`;
    textEntry.style.height = `${nextHeight}px`;
    textEntry.style.left = `${left + (edges.left || edges.right ? deltaX / 2 : 0)}px`;
    textEntry.style.top = `${top + (edges.top || edges.bottom ? deltaY / 2 : 0)}px`;
    textEntry.dataset.x = String((centerX - canvasBounds.left) / canvasBounds.width);
    textEntry.dataset.y = String((centerY - canvasBounds.top) / canvasBounds.height);
    event.preventDefault();
    return;
  }
  const { left, right, top, bottom } = textResizeEdges(event);
  const horizontal = left || right;
  const vertical = top || bottom;
  textEntry.style.cursor = horizontal && vertical
    ? (left === top ? "nwse-resize" : "nesw-resize")
    : horizontal ? "ew-resize" : vertical ? "ns-resize" : "text";
});
const finishTextResize = (event) => {
  if (textResizeState?.pointerId !== event.pointerId) return;
  textResizeState = null;
  if (textEntry.hasPointerCapture(event.pointerId)) textEntry.releasePointerCapture(event.pointerId);
};
textEntry.addEventListener("pointerup", finishTextResize);
textEntry.addEventListener("pointercancel", finishTextResize);
canvas.addEventListener("pointerdown", (event) => {
  if (textEntry.hidden) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  finishTextEntry();
}, true);

async function persistAutosave() {
  if (restoringAutosave || !autosaveEnabled) return;
  const savedNotesRevision = notesRevision;
  const referencedImageIds = new Set(drawing.getState().layers.flatMap((layer) =>
    layer.items.filter((item) => item.type === "image").map((item) => item.assetId)));
  const embeddedAssets = [...referencedImageIds].map((id) => {
    const asset = drawing.imageAssets.get(id);
    if (!asset) throw new Error(`Autosave cannot find image asset "${id}".`);
    return { id: asset.id, name: asset.name, blob: asset.blob, dataUrl: asset.dataUrl };
  });
  await saveProject({
    id: "goof-autosave",
    name: activeProjectName,
    updatedAt: Date.now(),
    width: activeProjectDimensions.width,
    height: activeProjectDimensions.height,
    infiniteCanvas: activeProjectInfinite,
    state: drawing.getState(),
    assets: embeddedAssets,
    notes: getProjectNotes(),
  });
  if (notesDirty && savedNotesRevision === notesRevision) {
    notesDirty = false;
    notesSaveStatus.textContent = "Saved";
  }
}

async function saveNotesNow() {
  if (!autosaveEnabled && !activeProjectId) {
    notesSaveStatus.textContent = "Local storage unavailable; note is not saved";
    return;
  }
  notesSaveStatus.textContent = "Saving…";
  try {
    await Promise.all([persistAutosave(), persistActiveProject()]);
    notesDirty = false;
    notesSaveStatus.textContent = "Saved";
    status.textContent = "Artwork notes saved on this device.";
  } catch (error) {
    notesSaveStatus.textContent = "Save failed; edits remain here.";
    announceError("Could not save artwork notes", error);
  }
}

function scheduleAutosave() {
  if (restoringAutosave || !autosaveEnabled) return;
  window.clearTimeout(autosaveTimer);
  const scheduledNotesRevision = notesRevision;
  autosaveTimer = window.setTimeout(() => {
    if (notesDirty) notesSaveStatus.textContent = "Saving…";
    Promise.all([persistAutosave(), persistActiveProject()]).then(() => {
      if (notesDirty && scheduledNotesRevision === notesRevision) {
        notesDirty = false;
        notesSaveStatus.textContent = "Saved";
      }
      if (!galleryScreen.hidden) return;
      status.textContent = `Saved on this device${activeProjectId ? ` · ${activeProjectName}` : ""}.`;
    }).catch((error) => {
      if (notesDirty) notesSaveStatus.textContent = "Save failed; edits remain here.";
      announceError("Could not autosave the drawing", error);
    });
  }, 650);
}

function assetType(asset) {
  if (!asset.assetKind) return "image";
  if (asset.assetKind === "scene-group") return "shape";
  const type = asset.item?.type;
  return type === "stroke" ? "drawing"
    : type === "text" || type === "shape" || type === "image" ? type
      : "drawing";
}

function renderAssetList() {
  const query = assetSearch.value.trim().toLocaleLowerCase();
  const collectionFilteredAssets = selectedCollectionIds.size === 0
    ? assets
    : assets.filter((asset) => selectedCollectionIds.has(
      asset.collectionId ?? UNCATEGORIZED_COLLECTION_ID));
  const filteredAssets = collectionFilteredAssets.filter((asset) => {
    const name = `${asset.name} ${asset.item?.text ?? ""} ${asset.item?.shape ?? ""}`.toLocaleLowerCase();
    return (activeAssetFilter === "all" || activeAssetFilter === assetType(asset)) &&
      (!query || name.includes(query));
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

  const typeLabels = { text: "Text", image: "Images", shape: "Shapes", drawing: "Drawings" };
  const groupedAssets = new Map();
  for (const asset of filteredAssets) {
    const type = assetType(asset);
    if (!groupedAssets.has(type)) groupedAssets.set(type, []);
    groupedAssets.get(type).push(asset);
  }
  for (const type of ["text", "image", "shape", "drawing"]) {
    const groupAssets = groupedAssets.get(type);
    if (!groupAssets?.length) continue;
    const group = document.createElement("section");
    group.className = "asset-kind-group";
    group.setAttribute("aria-label", typeLabels[type]);
    const heading = document.createElement("h3");
    heading.className = "asset-kind-heading";
    heading.textContent = typeLabels[type];
    const cards = document.createElement("div");
    cards.className = "asset-kind-items";
    group.append(heading, cards);
    assetList.append(group);
    for (const asset of groupAssets) {
    const card = document.createElement("div");
    card.className = `asset-card${selectedAssetIds.has(asset.id) ? " is-selected" : ""}`;
    card.draggable = true;
    card.addEventListener("dragstart", (event) => {
      event.dataTransfer?.setData("text/asset-id", asset.id);
      event.dataTransfer?.setData("application/x-goof-asset-id", asset.id);
      event.dataTransfer?.setData("text/plain", asset.id);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
    });
    const select = document.createElement("button");
    select.className = "asset-add";
    select.type = "button";
    select.setAttribute("aria-pressed", String(selectedAssetIds.has(asset.id)));
    select.setAttribute("aria-label", `Select ${asset.name}`);
    select.title = `Select ${asset.name}; hold Shift to add to selection`;
    if (type === "image") {
      const image = document.createElement("img");
      image.src = makeAssetPreview(asset);
      image.alt = "";
      image.loading = "lazy";
      select.append(image);
    } else {
      const icon = document.createElement("span");
      icon.className = `asset-kind-icon asset-kind-${type}`;
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = { text: "T", drawing: "〰", shape: "◇" }[type];
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
    cards.append(card);
    }
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
    const placed = ["scene-item", "scene-group"].includes(asset.assetKind)
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
  assets = (await listImageAssets()).filter((asset) =>
    !asset.assetKind || ["scene-item", "scene-group"].includes(asset.assetKind));
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
  if (!layer || (!layer.items.length && drawing.selectedItemIds.length < 2)) {
    status.textContent = "The active layer is empty; add items to it before saving to Assets.";
    return;
  }
  const selectedItems = drawing.getSelectedItems().filter((item) => !item.locked && item.visible !== false);
  const selectedCollectionId = selectedCollectionIds.size === 1 ? [...selectedCollectionIds][0] : null;
  const collectionId = selectedCollectionId === UNCATEGORIZED_COLLECTION_ID ? null : selectedCollectionId;
  if (selectedItems.length > 1) {
    const bounds = drawing.selectionBounds();
    if (!bounds) {
      status.textContent = "Select at least two unlocked objects before saving a group.";
      return;
    }
    const groupedItems = selectedItems.map((entry) => {
      const item = structuredClone(entry);
      delete item.layerId;
      delete item.locked;
      delete item.visible;
      for (const key of ["points", "curvePoints"]) {
        if (Array.isArray(item[key])) {
          item[key] = item[key].map((point) => ({
            x: point.x - bounds.x,
            y: point.y - bounds.y,
          }));
        }
      }
      if (Number.isFinite(item.x)) item.x -= bounds.x;
      if (Number.isFinite(item.y)) item.y -= bounds.y;
      return item;
    });
    const imageAssets = groupedItems
      .filter((item) => item.type === "image")
      .map((item) => {
        const imageAsset = drawing.imageAssets.get(item.assetId);
        if (!imageAsset) throw new Error(`The selected image asset "${item.assetId}" is missing.`);
        return structuredClone(imageAsset);
      });
    await saveImageAsset({
      id: createId("asset"),
      assetKind: "scene-group",
      category: "shape",
      name: `Group (${groupedItems.length})`,
      item: {
        type: "group",
        width: bounds.width,
        height: bounds.height,
        items: groupedItems,
      },
      imageAssets,
      createdAt: Date.now(),
      collectionId,
    });
    await refreshAssets();
    status.textContent = `Saved ${groupedItems.length} selected objects as a grouped asset. Their arrangement will be preserved when placed.`;
    return;
  }
  const items = layer.items.map((item) => structuredClone(item));
  const missingImage = items.find((item) =>
    item.type === "image" && !drawing.imageAssets.has(item.assetId));
  if (missingImage) {
    throw new Error(`The selected image asset "${missingImage.assetId}" is missing.`);
  }
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
  document.querySelector("#text-color-trigger").setAttribute("aria-label", `Choose text colour, current ${textColor.value}`);
  textSize.value = String(Math.round(item?.fontSize ?? 32));
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
      polygonSidesControl.hidden = value !== "polygon";
      updateShapeTool();
      selectTool("shapes");
      if (value === "polygon") {
        for (const button of shapeOptions.querySelectorAll(".shape-option")) {
          const selected = button === option;
          button.classList.toggle("is-active", selected);
          button.setAttribute("aria-pressed", String(selected));
        }
        status.textContent = "Polygon selected. Choose its number of sides, then close the picker to draw.";
        return;
      }
      shapeDialog.close();
      status.textContent = `${label} selected. Drag on the canvas to draw it.`;
    });
    shapeOptions.append(option);
  }
  shapeFillInput.checked = drawing.shapeFill;
  shapeStrokeInput.checked = drawing.shapeStroke;
  polygonSidesControl.hidden = drawing.shapeKind !== "polygon";
  polygonSidesInput.value = String(drawing.shapeSides);
  polygonSidesValue.value = String(drawing.shapeSides);
  polygonSidesValue.textContent = String(drawing.shapeSides);
  shapeDialog.showModal();
}
shapesButton.addEventListener("click", () => selectTool("shapes"));
shapesButton.addEventListener("dblclick", openShapePicker);
shapeFillInput.addEventListener("change", () => {
  drawing.shapeFill = shapeFillInput.checked;
});
shapeStrokeInput.addEventListener("change", () => {
  drawing.shapeStroke = shapeStrokeInput.checked;
});
polygonSidesInput.addEventListener("input", () => {
  drawing.shapeSides = Number(polygonSidesInput.value);
  polygonSidesValue.value = String(drawing.shapeSides);
  polygonSidesValue.textContent = String(drawing.shapeSides);
});
fillButton.addEventListener("click", () => selectTool("fill"));
fillButton.addEventListener("dblclick", () => {
  const willOpen = fillOptionsPopover.hidden;
  fillOptionsPopover.hidden = !willOpen;
  if (!willOpen) return;
  fillOptionsPopover.style.position = "fixed";
  const anchorBounds = fillButton.getBoundingClientRect();
  const popupBounds = fillOptionsPopover.getBoundingClientRect();
  const left = window.innerWidth - anchorBounds.right >= popupBounds.width + 12
    ? anchorBounds.right + 8
    : Math.max(12, window.innerWidth - popupBounds.width - 12);
  const below = anchorBounds.bottom + 8;
  const above = anchorBounds.top - popupBounds.height - 8;
  const top = below + popupBounds.height <= window.innerHeight - 12
    ? below
    : Math.max(12, above);
  fillOptionsPopover.style.left = `${left}px`;
  fillOptionsPopover.style.top = `${top}px`;
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
function setAssetFilter(type, announce = true) {
  const activeButton = [...assetFilterButtons].find((button) => button.dataset.assetFilter === type);
  if (!activeButton) throw new Error(`Unknown asset filter: ${type}`);
  activeAssetFilter = type;
  drawing.setItemTypeFilter(type);
  selectedAssetIds.clear();
  assetSelectionAnchorId = null;
  for (const button of assetFilterButtons) {
    const active = button === activeButton;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  }
  renderAssetList();
  if (announce) {
    status.textContent = type === "all"
      ? "All artwork types are visible on the canvas and in Assets."
      : `Only ${type} items are visible on the canvas and in Assets.`;
  }
}

for (const button of assetFilterButtons) {
  button.addEventListener("click", () => setAssetFilter(button.dataset.assetFilter));
}
assetFilterToggle.addEventListener("click", () => {
  const expanded = assetFilterToggle.getAttribute("aria-expanded") === "true";
  assetFilterToggle.setAttribute("aria-expanded", String(!expanded));
  assetFilters.hidden = expanded;
  assetFilterToggle.title = `${expanded ? "Expand" : "Collapse"} asset filters`;
});
assetFilterToggle.title = "Collapse asset filters";
aboutButton.addEventListener("click", () => {
  aboutDialog.showModal();
  aboutSignal.start();
});
homeAboutButton.addEventListener("click", () => {
  aboutDialog.showModal();
  aboutSignal.start();
});
closeAboutButton.addEventListener("click", () => aboutDialog.close());
brushButton.title = "Brush";
eraserButton.title = "Eraser";
selectButton.title = "Select";
shapesButton.title = "Rectangle";
fillButton.title = "Fill";
addTextButton.title = "Text";
assetsToggle.title = "Assets";
notesToggle.title = "Notes";
clearButton.title = "Clear Canvas · double-click to change effect";
brushButton.addEventListener("dblclick", () => openToolSettings("brush"));
eraserButton.addEventListener("dblclick", () => openToolSettings("eraser"));
document.addEventListener("pointerdown", (event) => {
  if (!toolSettingsPopover.hidden &&
      !toolSettingsPopover.contains(event.target) &&
      !document.querySelector("#brush-color-popover").contains(event.target) &&
      !brushButton.contains(event.target) &&
      !eraserButton.contains(event.target)) {
    toolSettingsPopover.hidden = true;
    brushButton.setAttribute("aria-expanded", "false");
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !toolSettingsPopover.hidden) {
    toolSettingsPopover.hidden = true;
    brushButton.setAttribute("aria-expanded", "false");
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
    stroke: shapeStrokeEnabledInput.checked,
    color: shapeOutlineColorInput.value,
    strokeWidth: Number(shapeOutlineWidthInput.value),
  })) {
    status.textContent = "Shape fill and outline updated.";
  }
  shapePropertiesDialog.close();
});
shapeFillEnabledInput.addEventListener("change", updateShapeStyleToggleAvailability);
shapeStrokeEnabledInput.addEventListener("change", updateShapeStyleToggleAvailability);
cancelShapePropertiesButton.addEventListener("click", () => shapePropertiesDialog.close());
shapeOutlineWidthInput.addEventListener("input", () => {
  shapeOutlineWidthValue.value = `${shapeOutlineWidthInput.value} px`;
  shapeOutlineWidthValue.textContent = shapeOutlineWidthValue.value;
});
shapePropertiesDialog.addEventListener("close", () => {
  editingShapeId = null;
});
themeButton.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});
function setWorkspacePanel(name, toggleIfActive = false) {
  if (name !== "layers" && name !== "assets") {
    throw new Error(`Unknown workspace panel: ${name}`);
  }
  dismissNotesForTool();
  const layout = document.querySelector(".editor-layout");
  const panelWasOpen = !layout.classList.contains("sidebar-collapsed");
  const shouldOpen = !(toggleIfActive && panelWasOpen && activeWorkspacePanel === name);
  activeWorkspacePanel = name;
  layout.classList.toggle("sidebar-collapsed", !shouldOpen);
  editorPanel.setAttribute("aria-hidden", String(!shouldOpen));
  editorPanel.inert = !shouldOpen;
  assetsPanelView.hidden = name !== "assets";
  layersPanelView.hidden = name !== "layers";
  for (const tab of workspacePanelTabs) {
    const selected = tab.dataset.workspacePanel === name;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-pressed", String(selected));
  }
  sidebarToggle.setAttribute("aria-expanded", String(shouldOpen && name === "layers"));
  assetsToggle.setAttribute("aria-expanded", String(shouldOpen && name === "assets"));
  panelSidebarToggle.setAttribute("aria-expanded", String(shouldOpen));
  sidebarToggle.setAttribute("aria-label", "Layers");
  sidebarToggle.title = "Layers";
  assetsToggle.setAttribute("aria-label", "Assets");
  assetsToggle.title = "Assets";
  panelSidebarToggle.setAttribute("aria-label", "Hide panel");
  panelSidebarToggle.title = "Hide panel";
  if (shouldOpen) status.textContent = `${name === "layers" ? "Layers" : "Assets"} panel shown.`;
  else status.textContent = `${name === "layers" ? "Layers" : "Assets"} panel hidden.`;
}

notesToggle.addEventListener("click", () => setNotesVisible(notesPanel.hidden));
notesNeovimToggle.addEventListener("click", () => setNotesNeovimMode(!vimModeEnabled));
document.addEventListener("pointerdown", (event) => {
  if (notesPanel.hidden) return;
  const target = event.target;
  if (target instanceof Node && !notesSaveMenu.contains(target) && target !== notesSaveButton) {
    notesSaveMenu.hidden = true;
    notesSaveButton.setAttribute("aria-expanded", "false");
  }
  if (target instanceof Node && !savedNotesPopover.contains(target) && target !== savedNotesToggle) {
    savedNotesPopover.hidden = true;
    savedNotesToggle.setAttribute("aria-expanded", "false");
  }
  if (!(target instanceof Node) || notesPanel.contains(target) || notesToggle.contains(target)) return;
  setNotesVisible(false);
});
notesEditModeButton.addEventListener("click", () => setNotesMode("edit"));
notesPreviewModeButton.addEventListener("click", () => setNotesMode("preview"));
notesSaveButton.addEventListener("click", () => {
  notesSaveMenu.hidden = !notesSaveMenu.hidden;
  savedNotesPopover.hidden = true;
  notesSaveButton.setAttribute("aria-expanded", String(!notesSaveMenu.hidden));
  savedNotesToggle.setAttribute("aria-expanded", "false");
});
savedNotesToggle.addEventListener("click", () => {
  savedNotesPopover.hidden = !savedNotesPopover.hidden;
  notesSaveMenu.hidden = true;
  notesSaveButton.setAttribute("aria-expanded", "false");
  savedNotesToggle.setAttribute("aria-expanded", String(!savedNotesPopover.hidden));
  if (!savedNotesPopover.hidden) {
    renderSavedNotesPopover().catch((error) => {
      savedNotesPopover.hidden = true;
      savedNotesToggle.setAttribute("aria-expanded", "false");
      announceError("Could not load saved notes", error);
    });
  }
});
for (const button of notesFormatButtons) {
  button.addEventListener("click", () => {
    notesSaveMenu.hidden = true;
    notesSaveButton.setAttribute("aria-expanded", "false");
    void saveIndependentNote(button.dataset.notesFormat);
  });
}
function markNotesChanged() {
  notesRevision += 1;
  notesDirty = true;
  notesLastValue = notesContentInput.value;
  notesSaveStatus.textContent = autosaveEnabled
    ? "Unsaved changes"
    : "Local storage unavailable; note is not saved";
  scheduleAutosave();
  if (notesMode === "preview") renderNotesPreview();
}
notesTitleInput.addEventListener("input", markNotesChanged);
notesContentInput.addEventListener("input", () => {
  const next = notesContentInput.value;
  if (next !== notesLastValue) {
    notesUndoStack.push(notesLastValue);
    if (notesUndoStack.length > 200) notesUndoStack.shift();
    notesRedoStack = [];
    notesLastValue = next;
  }
  markNotesChanged();
  requestAnimationFrame(updateNotesBlockCaret);
});
for (const eventName of ["click", "keyup", "select", "scroll"]) {
  notesContentInput.addEventListener(eventName, () => requestAnimationFrame(updateNotesBlockCaret));
}
document.addEventListener("selectionchange", () => {
  if (document.activeElement === notesContentInput) requestAnimationFrame(updateNotesBlockCaret);
});
notesCrtThemeToggle.addEventListener("click", () => {
  setNotesCrtTheme(vimCrtTheme === "green" ? "amber" : "green");
});
for (const eventName of ["keyup", "click", "select", "scroll"]) {
  notesContentInput.addEventListener(eventName, updateNotesBlockCaret);
}
document.addEventListener("selectionchange", updateNotesBlockCaret);
window.addEventListener("resize", updateNotesBlockCaret);
function downloadNotes(extension, title, content) {
  const filenameBase = (title.trim() || activeProjectName || "Note")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 80) || "Artwork notes";
  const mimeType = extension === "md" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8";
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement("a");
  link.className = "sr-only";
  link.href = url;
  link.download = `${filenameBase}.${extension}`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function saveIndependentNote(extension) {
  if (!["md", "txt"].includes(extension)) {
    throw new Error("Choose Plain Text or Markdown to save this note.");
  }
  const title = notesTitleInput.value.trim() || "Untitled note";
  const content = notesContentInput.value;
  if (!content.trim() && !notesTitleInput.value.trim()) {
    notesSaveStatus.textContent = "Write a title or note before saving.";
    notesTitleInput.focus();
    return;
  }
  const now = Date.now();
  const note = {
    id: createId("note"),
    title,
    content,
    format: extension,
    createdAt: now,
    updatedAt: now,
  };
  notesSaveStatus.textContent = "Saving note…";
  let downloadError;
  try {
    try {
      downloadNotes(extension, title, content);
    } catch (error) {
      downloadError = error;
    }
    await saveNote(note);
    pendingSaveNoteId = note.id;
    notesSaveStatus.textContent = downloadError ? "Saved locally; download failed." : "Saved";
    status.textContent = downloadError
      ? `Saved “${title}” locally, but the file download failed.`
      : `Saved “${title}” as a new note.`;
    if (downloadError) {
      console.error("The note was saved locally, but its download failed.", downloadError);
    }
    try {
      await renderSavedNotes(await listProjects());
      if (!savedNotesPopover.hidden) await renderSavedNotesPopover();
    } catch (error) {
      notesSaveStatus.textContent = "Saved; saved-note lists could not refresh.";
      announceError("The note was saved, but saved-note lists could not refresh", error);
    }
  } catch (error) {
    notesSaveStatus.textContent = "Save failed.";
    announceError("Could not save this note", error);
  }
}

async function renderSavedNotes(projects = []) {
  savedNoteRecords = await listNotes();
  savedNotesGrid.replaceChildren();
  const artworkNotes = projects.filter(hasArtworkNote);
  savedNotesCount.textContent = String(savedNoteRecords.length + artworkNotes.length);
  for (const note of savedNoteRecords) {
    const card = document.createElement("article");
    card.className = "saved-note-card";
    card.dataset.noteId = note.id;
    if (note.id === pendingSaveNoteId) card.classList.add("is-new");
    const open = document.createElement("button");
    open.className = "saved-note-open";
    open.type = "button";
    const title = document.createElement("strong");
    title.textContent = note.title || "Untitled note";
    const excerpt = document.createElement("span");
    excerpt.textContent = note.content?.trim().slice(0, 190) || "No note text";
    const date = document.createElement("small");
    date.textContent = `${note.format === "md" ? "Markdown" : "Plain Text"} · ${formatProjectDate(note.updatedAt)}`;
    open.append(title, excerpt, date);
    open.addEventListener("click", () => openSavedNote(note));
    const remove = createProjectAction("delete", `Delete note ${note.title || "Untitled note"}`,
      "M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3");
    remove.addEventListener("click", () => void removeSavedNote(note));
    card.append(open, remove);
    savedNotesGrid.append(card);
    if (note.id === pendingSaveNoteId) {
      window.setTimeout(() => card.classList.remove("is-new"), 900);
      pendingSaveNoteId = null;
    }
  }
  for (const project of artworkNotes) {
    const card = document.createElement("article");
    card.className = "saved-note-card is-artwork-note";
    const open = document.createElement("button");
    open.className = "saved-note-open";
    open.type = "button";
    const title = document.createElement("strong");
    title.textContent = getArtworkNoteTitle(project) || `Notes · ${project.name}`;
    const excerpt = document.createElement("span");
    excerpt.textContent = getArtworkNoteContent(project).trim().slice(0, 190) || "No note text";
    const date = document.createElement("small");
    date.textContent = `Artwork note · ${formatProjectDate(project.updatedAt)}`;
    open.append(title, excerpt, date);
    open.addEventListener("click", () => void openProjectNote(project));
    card.append(open);
    savedNotesGrid.append(card);
  }
  if (!savedNoteRecords.length && !artworkNotes.length) {
    const empty = document.createElement("p");
    empty.className = "saved-notes-empty";
    empty.textContent = "Notes you save will appear here.";
    savedNotesGrid.append(empty);
  }
}

async function renderSavedNotesPopover() {
  const notes = await listNotes();
  const projects = await listProjects();
  const artworkNotes = projects.filter(hasArtworkNote);
  savedNoteRecords = notes;
  savedNotesList.replaceChildren();
  if (!notes.length && !artworkNotes.length) {
    const empty = document.createElement("p");
    empty.textContent = "No saved notes yet.";
    savedNotesList.append(empty);
    return;
  }
  for (const note of notes) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "saved-note-option";
    button.dataset.noteId = note.id;
    const title = document.createElement("strong");
    title.textContent = note.title || "Untitled note";
    const preview = document.createElement("span");
    preview.textContent = note.content?.trim().slice(0, 90) || "No note text";
    button.append(title, preview);
    button.addEventListener("click", () => {
      notesTitleInput.value = note.title ?? "";
      notesContentInput.value = note.content ?? "";
      notesLastValue = notesContentInput.value;
      notesUndoStack = [];
      notesRedoStack = [];
      markNotesChanged();
      savedNotesPopover.hidden = true;
      savedNotesToggle.setAttribute("aria-expanded", "false");
      setNotesMode("edit");
      notesContentInput.focus();
    });
    savedNotesList.append(button);
  }
  for (const project of artworkNotes) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "saved-note-option";
    const title = document.createElement("strong");
    title.textContent = getArtworkNoteTitle(project) || `Notes · ${project.name}`;
    const preview = document.createElement("span");
    preview.textContent = getArtworkNoteContent(project).trim().slice(0, 90) || "No note text";
    button.append(title, preview);
    button.addEventListener("click", () => {
      savedNotesPopover.hidden = true;
      savedNotesToggle.setAttribute("aria-expanded", "false");
      void openProjectNote(project);
    });
    savedNotesList.append(button);
  }
}

function getArtworkNoteTitle(project) {
  return typeof project.notes?.title === "string" ? project.notes.title.trim() : "";
}

function getArtworkNoteContent(project) {
  return typeof project.notes?.content === "string" ? project.notes.content : "";
}

function hasArtworkNote(project) {
  return project.id !== "goof-autosave" &&
    (getArtworkNoteTitle(project) || getArtworkNoteContent(project).trim());
}

async function openProjectNote(project) {
  await openProject(project);
  if (activeProjectId === project.id) setNotesVisible(true);
}

function openSavedNote(note) {
  savedNoteDialogTitle.textContent = note.title || "Untitled note";
  savedNoteDialogBody.textContent = note.content ?? "";
  savedNoteDialog.showModal();
}
savedNoteDialogClose.addEventListener("click", () => savedNoteDialog.close());
savedNoteDialog.addEventListener("click", (event) => {
  if (event.target === savedNoteDialog) savedNoteDialog.close();
});

async function removeSavedNote(note) {
  if (!window.confirm(`Delete saved note “${note.title || "Untitled note"}”?`)) return;
  try {
    await deleteNote(note.id);
    await renderSavedNotes(await listProjects());
    await renderSavedNotesPopover();
    status.textContent = `Deleted “${note.title || "Untitled note"}”.`;
  } catch (error) {
    announceError("Could not delete this note", error);
  }
}

notesContentInput.addEventListener("keydown", (event) => {
  if (notesMode !== "edit") return;
  const text = notesContentInput.value;
  const start = notesContentInput.selectionStart;
  const end = notesContentInput.selectionEnd;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "o") {
    event.preventDefault();
    openCommandPalette({ searchNotes: true });
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "r" &&
      vimEditorMode === "normal") {
    event.preventDefault();
    const next = notesRedoStack.pop();
    if (next !== undefined) {
      notesUndoStack.push(text);
      notesContentInput.value = next;
      notesLastValue = next;
      notesContentInput.setSelectionRange(Math.min(start, next.length), Math.min(start, next.length));
      notesContentInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "e") {
    event.preventDefault();
    toggleNotesEditPreview();
    return;
  }
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === "Escape") {
    event.preventDefault();
    if (vimModeEnabled) {
      vimDeletePending = false;
      vimChangePending = false;
      vimReplacePending = false;
      vimGoPending = false;
      vimYankLine = "";
      vimYankPending = false;
      notesVimSearch.hidden = true;
      if (vimEditorMode === "insert") {
        const normalPosition = Math.max(0, start - 1);
        notesContentInput.setSelectionRange(normalPosition, normalPosition);
        updateVimEditorMode("normal");
      } else {
        updateNotesBlockCaret();
      }
    } else {
      setNotesVisible(false);
      notesToggle.focus();
    }
    return;
  }
  if (vimEditorMode === "insert") return;
  if (event.key === "/") {
    event.preventDefault();
    openVimSearch();
    return;
  }
  const moveCursor = (position) => {
    const next = Math.max(0, Math.min(text.length, position));
    notesContentInput.setSelectionRange(next, next);
  };
  const lineStartAt = (position) => text.lastIndexOf("\n", Math.max(0, position - 1)) + 1;
  const lineEndAt = (position) => {
    const breakAt = text.indexOf("\n", position);
    return breakAt < 0 ? text.length : breakAt;
  };
  const mutate = (nextText, caret) => {
    notesContentInput.value = nextText;
    notesLastValue = nextText;
    notesContentInput.setSelectionRange(caret, caret);
    notesUndoStack.push(text);
    notesRedoStack = [];
    notesContentInput.dispatchEvent(new Event("input", { bubbles: true }));
  };
  if (vimGoPending) {
    vimGoPending = false;
    if (event.key === "g") {
      event.preventDefault();
      moveCursor(0);
    }
    return;
  }
  if (vimYankPending) {
    vimYankPending = false;
    if (event.key === "y") {
      event.preventDefault();
      const lineStart = lineStartAt(start);
      vimYankLine = text.slice(lineStart, lineEndAt(start));
      return;
    }
  }
  if (vimReplacePending) {
    vimReplacePending = false;
    if (event.key.length === 1 && start < text.length) {
      event.preventDefault();
      mutate(text.slice(0, start) + event.key + text.slice(start + 1), start);
    }
    return;
  }
  if (vimChangePending) {
    vimChangePending = false;
    if (event.key === "w") {
      event.preventDefault();
      let wordEnd = start;
      while (wordEnd < text.length && /\w/.test(text[wordEnd])) wordEnd += 1;
      while (wordEnd < text.length && !/\w/.test(text[wordEnd])) wordEnd += 1;
      mutate(text.slice(0, start) + text.slice(wordEnd), start);
      updateVimEditorMode("insert");
    } else if (event.key === "c") {
      event.preventDefault();
      const lineStart = lineStartAt(start);
      const lineEnd = lineEndAt(start);
      mutate(text.slice(0, lineStart) + text.slice(lineEnd), lineStart);
      updateVimEditorMode("insert");
    }
    return;
  }
  if (vimDeletePending) {
    vimDeletePending = false;
    if (event.key === "d") {
      event.preventDefault();
      const lineStart = lineStartAt(start);
      const lineEnd = lineEndAt(start);
      const removesPreviousBreak = lineEnd === text.length && lineStart > 0;
      const removeStart = removesPreviousBreak ? lineStart - 1 : lineStart;
      const removeEnd = lineEnd < text.length ? lineEnd + 1 : lineEnd;
      mutate(text.slice(0, removeStart) + text.slice(removeEnd),
        removesPreviousBreak ? removeStart : lineStart);
    } else if (event.key === "Escape") {
      event.preventDefault();
    }
    return;
  }
  if (event.key === "i" || event.key === "a" || event.key === "A" ||
      event.key === "I" || event.key === "o" || event.key === "O") {
    event.preventDefault();
    if (event.key === "a") moveCursor(end > start ? end : Math.min(text.length, start + 1));
    if (event.key === "A") moveCursor(lineEndAt(start));
    if (event.key === "I") moveCursor(lineStartAt(start));
    if (event.key === "o" || event.key === "O") {
      const lineStart = lineStartAt(start);
      const lineEnd = lineEndAt(start);
      const insertion = event.key === "o" ? lineEnd + (lineEnd < text.length ? 1 : 0) : lineStart;
      const prefix = event.key === "o" && lineEnd === text.length ? "\n" : "";
      mutate(text.slice(0, insertion) + prefix + "\n" + text.slice(insertion), insertion + prefix.length + 1);
    }
    updateVimEditorMode("insert");
  } else if (event.key === "h" || event.key === "ArrowLeft") {
    event.preventDefault();
    moveCursor(start - 1);
  } else if (event.key === "l" || event.key === "ArrowRight") {
    event.preventDefault();
    moveCursor(end > start ? end : start + 1);
  } else if (event.key === "0") {
    event.preventDefault();
    moveCursor(lineStartAt(start));
  } else if (event.key === "^") {
    event.preventDefault();
    const lineStart = lineStartAt(start);
    const firstText = text.slice(lineStart, lineEndAt(start)).search(/\S/);
    moveCursor(firstText < 0 ? lineStart : lineStart + firstText);
  } else if (event.key === "$") {
    event.preventDefault();
    moveCursor(lineEndAt(start));
  } else if (event.key === "j" || event.key === "k" ||
             event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const lineStart = lineStartAt(start);
    const column = start - lineStart;
    const targetLineStart = event.key === "j" || event.key === "ArrowDown"
      ? text.indexOf("\n", start) + 1
      : text.lastIndexOf("\n", Math.max(0, lineStart - 2)) + 1;
    if (targetLineStart > 0 && targetLineStart <= text.length) {
      const targetLineEnd = text.indexOf("\n", targetLineStart);
      moveCursor(Math.min(targetLineStart + column, targetLineEnd < 0 ? text.length : targetLineEnd));
    }
  } else if (event.key === "w" || event.key === "b" || event.key === "e") {
    event.preventDefault();
    const word = /\w/;
    let position = start;
    if (event.key === "w") {
      while (position < text.length && word.test(text[position])) position += 1;
      while (position < text.length && !word.test(text[position])) position += 1;
    } else if (event.key === "b") {
      position = Math.max(0, position - 1);
      while (position > 0 && !word.test(text[position])) position -= 1;
      while (position > 0 && word.test(text[position - 1])) position -= 1;
    } else {
      while (position < text.length && !word.test(text[position])) position += 1;
      while (position < text.length && word.test(text[position])) position += 1;
      position = Math.max(start, position - 1);
    }
    moveCursor(position);
  } else if (event.key === "x") {
    event.preventDefault();
    const removeEnd = end > start ? end : Math.min(text.length, start + 1);
    mutate(text.slice(0, start) + text.slice(removeEnd), start);
  } else if (event.key === "d") {
    event.preventDefault();
    vimDeletePending = true;
  } else if (event.key === "c") {
    event.preventDefault();
    vimChangePending = true;
  } else if (event.key === "r") {
    event.preventDefault();
    vimReplacePending = true;
  } else if (event.key === "g") {
    event.preventDefault();
    vimGoPending = true;
  } else if (event.key === "G") {
    event.preventDefault();
    moveCursor(text.length);
  } else if (event.key === "D") {
    event.preventDefault();
    mutate(text.slice(0, start) + text.slice(lineEndAt(start)), start);
  } else if (event.key === "C") {
    event.preventDefault();
    mutate(text.slice(0, start) + text.slice(lineEndAt(start)), start);
    updateVimEditorMode("insert");
  } else if (event.key === "J") {
    event.preventDefault();
    const lineEnd = lineEndAt(start);
    if (lineEnd < text.length) {
      const nextLineStart = lineEnd + 1;
      const joined = `${text.slice(0, lineEnd).replace(/\s+$/, "")} ${text.slice(nextLineStart).replace(/^\s+/, "")}`;
      mutate(joined, lineEnd + 1);
    }
  } else if (event.key === "y") {
    event.preventDefault();
    vimYankPending = true;
  } else if (event.key === "n" || event.key === "N") {
    event.preventDefault();
    findVimSearchMatch(event.key === "N");
  } else if (event.key === "p") {
    event.preventDefault();
    if (vimYankLine) {
      const lineEnd = lineEndAt(start);
      const insertion = lineEnd < text.length ? lineEnd + 1 : text.length;
      mutate(text.slice(0, insertion) + vimYankLine + "\n" + text.slice(insertion),
        insertion + vimYankLine.length);
    }
  } else if (event.key === "P") {
    event.preventDefault();
    if (vimYankLine) {
      const insertion = lineStartAt(start);
      mutate(text.slice(0, insertion) + vimYankLine + "\n" + text.slice(insertion),
        insertion + vimYankLine.length);
    }
  } else if (event.key === "u") {
    event.preventDefault();
    const previous = notesUndoStack.pop();
    if (previous !== undefined) {
      notesRedoStack.push(text);
      notesContentInput.value = previous;
      notesLastValue = previous;
      moveCursor(Math.min(start, previous.length));
      notesContentInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
});

sidebarToggle.addEventListener("click", () => setWorkspacePanel("layers", true));
assetsToggle.addEventListener("click", () => setWorkspacePanel("assets", true));
panelSidebarToggle.addEventListener("click", () => setWorkspacePanel(activeWorkspacePanel, true));
for (const tab of workspacePanelTabs) {
  tab.addEventListener("click", () => setWorkspacePanel(tab.dataset.workspacePanel));
}
document.addEventListener("pointerdown", (event) => {
  if (editorPanel.getAttribute("aria-hidden") === "true" || editorPanel.contains(event.target) ||
      sidebarToggle.contains(event.target) || assetsToggle.contains(event.target)) return;
  setWorkspacePanel(activeWorkspacePanel, true);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && editorPanel.getAttribute("aria-hidden") === "false") {
    setWorkspacePanel(activeWorkspacePanel, true);
  }
});
workspaceActionsToggle.addEventListener("click", () => {
  const willOpen = workspaceActionsMenu.hidden;
  workspaceActionsMenu.hidden = !willOpen;
  workspaceActionsToggle.setAttribute("aria-expanded", String(willOpen));
});
document.addEventListener("pointerdown", (event) => {
  if (!workspaceActionsMenu.hidden && !workspaceActionsMenu.contains(event.target) &&
      !workspaceActionsToggle.contains(event.target)) {
    workspaceActionsMenu.hidden = true;
    workspaceActionsToggle.setAttribute("aria-expanded", "false");
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !workspaceActionsMenu.hidden) {
    workspaceActionsMenu.hidden = true;
    workspaceActionsToggle.setAttribute("aria-expanded", "false");
    workspaceActionsToggle.focus();
  }
});
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
  const valueSlider = popover.querySelector("[data-color-value]");
  const applyButton = popover.querySelector("[data-color-apply]");
  const clearFillButton = popover.querySelector("[data-clear-fill]");
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
    wheel.style.setProperty("--hue-x", `${50 + Math.sin(hsv.h * Math.PI / 180) * 40}%`);
    wheel.style.setProperty("--hue-y", `${50 - Math.cos(hsv.h * Math.PI / 180) * 40}%`);
    wheel.setAttribute("aria-valuenow", String(Math.round(hsv.h)));
    wheel.setAttribute("aria-valuetext", `Hue ${Math.round(hsv.h)} degrees`);
    valueSlider.value = String(Math.round((1 - hsv.v) * 100));
  };
  const setColor = (color) => {
    input.value = color;
    hsv = hexToHsv(color);
    updatePickerSurface();
    chip.style.backgroundColor = color;
    trigger.setAttribute("aria-label", `Choose colour, current ${color}`);
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
      announceError("Could not save colour to palette", error);
    }
  });
  input.addEventListener("input", () => {
    hsv = hexToHsv(input.value);
    updatePickerSurface();
    chip.style.backgroundColor = input.value;
    trigger.setAttribute("aria-label", `Choose colour, current ${input.value}`);
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
      if (window.matchMedia("(max-width: 767px)").matches) {
        const viewportWidth = document.documentElement.clientWidth;
        const popupWidth = Math.min(420, viewportWidth - 16);
        const viewportGutter = Math.max(0, (window.innerWidth - viewportWidth) / 2);
        popover.style.width = `${popupWidth}px`;
        popover.style.left = `${Math.max(0, (viewportWidth - popupWidth) / 2 - viewportGutter)}px`;
        popover.style.top = "auto";
        popover.style.bottom = "calc(env(safe-area-inset-bottom, 0px) + 94px)";
        popover.style.maxHeight = "min(64svh, 520px)";
        popover.style.overflowY = "auto";
        return;
      }
      popover.style.width = "";
      popover.style.bottom = "";
      popover.style.maxHeight = "";
      popover.style.overflowY = "";
      const popupBounds = popover.getBoundingClientRect();
      const left = window.innerWidth - anchorBounds.right >= popupBounds.width + 12
        ? anchorBounds.right + 8
        : Math.max(12, anchorBounds.left - popupBounds.width - 8);
      const below = anchorBounds.bottom + 8;
      const above = anchorBounds.top - popupBounds.height - 8;
      const insideDialog = Boolean(popover.closest("dialog")?.open);
      const top = (insideDialog || below + popupBounds.height > window.innerHeight - 12) && above >= 12
        ? above
        : Math.max(12, Math.min(below, window.innerHeight - popupBounds.height - 12));
      popover.style.left = `${left}px`;
      popover.style.top = `${top}px`;
    }
  });
  const chooseWheelHue = (event) => {
    const bounds = wheel.getBoundingClientRect();
    const angle = Math.atan2(event.clientY - bounds.top - bounds.height / 2, event.clientX - bounds.left - bounds.width / 2);
    hsv.h = (angle * 180 / Math.PI + 360 + 90) % 360;
    if (hsv.s === 0) hsv.s = 1;
    if (hsv.v === 0) hsv.v = 1;
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
  valueSlider.addEventListener("input", () => {
    hsv.s = 0;
    hsv.v = 1 - Number(valueSlider.value) / 100;
    setColor(hsvToHex(hsv.h, hsv.s, hsv.v));
  });
  applyButton.addEventListener("click", () => {
    popover.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (popover.closest("#shape-properties-dialog")) {
      if (inputId === "shape-fill-color") {
        shapeFillEnabledInput.checked = true;
        chip.classList.remove("is-empty");
      } else if (inputId === "shape-outline-color") {
        shapeStrokeEnabledInput.checked = true;
      }
      updateShapeStyleToggleAvailability();
      shapePropertiesForm.requestSubmit();
      for (const colorTrigger of document.querySelectorAll(".shape-properties-dialog .color-trigger")) {
        colorTrigger.setAttribute("aria-expanded", "false");
      }
    }
  });
  clearFillButton?.addEventListener("click", () => {
    shapeFillEnabledInput.checked = false;
    chip.classList.add("is-empty");
    trigger.setAttribute("aria-label", "Shape fill colour: none");
    popover.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    shapePropertiesForm.requestSubmit();
    for (const colorTrigger of document.querySelectorAll(".shape-properties-dialog .color-trigger")) {
      colorTrigger.setAttribute("aria-expanded", "false");
    }
  });
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
document.body.append(document.querySelector("#brush-color-popover"));
setupColorPicker("text-color-trigger", "text-color-popover", "text-color", "text-color-chip");
setupColorPicker("shape-fill-color-trigger", "shape-fill-color-popover", "shape-fill-color", "shape-fill-color-chip");
setupColorPicker("shape-outline-color-trigger", "shape-outline-color-popover", "shape-outline-color", "shape-outline-color-chip");
setupColorPicker("new-project-custom-background", "new-project-background-popover",
  "new-project-background", "new-project-background-chip");

sizeInput.addEventListener("input", () => {
  const size = Number(sizeInput.value);
  sizeOutput.value = `${size} px`;
  sizeOutput.textContent = `${size} px`;
  drawing.setBrush({ size });
});
opacityInput.addEventListener("input", () => {
  const opacity = Number(opacityInput.value);
  opacityOutput.value = `${opacity}%`;
  opacityOutput.textContent = opacityOutput.value;
  drawing.setBrush({ opacity: opacity / 100 });
});

const clearEffectStorageKey = "goof-clear-effect";
function rememberedClearEffect() {
  try {
    const effect = localStorage.getItem(clearEffectStorageKey);
    if (["circling", "dots", "spinner"].includes(effect)) return effect;
    if (effect === "inferno") return "spinner";
    if (effect === "whirlpool") return "circling";
    if (effect === "airstream") return "dots";
    return null;
  } catch (error) {
    announceError("Could not read the saved clearing effect", error);
    return null;
  }
}

function rememberSelectedClearEffect(effect) {
  try {
    if (rememberClearEffectInput.checked) localStorage.setItem(clearEffectStorageKey, effect);
    else localStorage.removeItem(clearEffectStorageKey);
  } catch (error) {
    announceError("Could not save the clearing effect preference", error);
  }
}

function showClearEffectDialog() {
  const remembered = rememberedClearEffect();
  rememberClearEffectInput.checked = Boolean(remembered);
  const selectedEffect = remembered ?? "circling";
  for (const option of clearEffectButtons) {
    option.setAttribute("aria-pressed", String(option.dataset.clearEffect === selectedEffect));
  }
  clearDialog.showModal();
}

function playClearEffect(effect, label) {
  if (!["circling", "dots", "spinner"].includes(effect)) {
    throw new Error("A valid canvas clearing effect could not be selected.");
  }
  const surface = document.querySelector(".canvas-container");
  if (!surface) throw new Error("The canvas surface is not available.");
  const effectElement = document.createElement("div");
  effectElement.className = `canvas-clear-effect canvas-clear-${effect}`;
  effectElement.setAttribute("aria-hidden", "true");
  surface.append(effectElement);
  const coverKeyframes = {
    circling: [
      { clipPath: "circle(0 at 50% 50%)", opacity: .2, transform: "rotate(-35deg) scale(.5)" },
      { clipPath: "circle(72% at 50% 50%)", opacity: .94, transform: "rotate(95deg) scale(1.02)", offset: .68 },
      { clipPath: "circle(115% at 50% 50%)", opacity: 1, transform: "rotate(180deg) scale(1.12)" },
    ],
    dots: [
      { opacity: 0, transform: "scale(.28)" },
      { opacity: .92, transform: "scale(.88)", offset: .64 },
      { opacity: 1, transform: "scale(1.08)" },
    ],
    spinner: [
      { clipPath: "circle(0 at 50% 50%)", opacity: .2, transform: "rotate(-180deg) scale(.32)" },
      { clipPath: "circle(78% at 50% 50%)", opacity: .96, transform: "rotate(420deg) scale(1.02)", offset: .7 },
      { clipPath: "circle(120% at 50% 50%)", opacity: 1, transform: "rotate(720deg) scale(1.12)" },
    ],
  };
  try {
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cover = effectElement.animate(coverKeyframes[effect], {
      duration: reducedMotion ? 220 : effect === "dots" ? 680 : 820,
      easing: "cubic-bezier(.2, .72, .22, 1)",
      fill: "forwards",
    });
    cover.finished.then(async () => {
      const cleared = drawing.clear();
      const exitTransform = effect === "circling"
        ? "rotate(-165deg) scale(.24)"
        : effect === "spinner" ? "rotate(540deg) scale(1.55)" : "scale(.72)";
      await effectElement.animate([
        { opacity: 1, transform: getComputedStyle(effectElement).transform },
        { opacity: 0, transform: exitTransform, filter: "blur(8px)" },
      ], {
        duration: reducedMotion ? 120 : effect === "dots" ? 360 : 440,
        easing: "cubic-bezier(.4, 0, .2, 1)",
        fill: "forwards",
      }).finished;
      effectElement.remove();
      status.textContent = cleared
        ? `Canvas cleared with ${label.toLocaleLowerCase()}.`
        : "Canvas is already clear.";
    }).catch((error) => {
      effectElement.remove();
      announceError("Could not finish the canvas clearing animation", error);
    });
  } catch (error) {
    effectElement.remove();
    announceError("Could not animate clearing the canvas", error);
  }
}

clearButton.addEventListener("click", () => {
  window.clearTimeout(clearActivationTimer);
  clearActivationTimer = window.setTimeout(() => {
    clearActivationTimer = null;
    activateClearCanvas();
  }, 260);
});
function activateClearCanvas() {
  const remembered = rememberedClearEffect();
  if (!remembered) {
    showClearEffectDialog();
    return;
  }
  const selected = [...clearEffectButtons].find((option) => option.dataset.clearEffect === remembered);
  playClearEffect(remembered, selected?.querySelector("strong").textContent ?? remembered);
}
clearButton.addEventListener("dblclick", (event) => {
  event.preventDefault();
  window.clearTimeout(clearActivationTimer);
  clearActivationTimer = null;
  showClearEffectDialog();
});
clearCancelButton.addEventListener("click", () => clearDialog.close());
for (const button of clearEffectButtons) {
  button.addEventListener("click", () => {
    for (const option of clearEffectButtons) {
      option.setAttribute("aria-pressed", String(option === button));
    }
  });
}
clearConfirmButton.addEventListener("click", () => {
  const selected = [...clearEffectButtons].find((option) =>
    option.getAttribute("aria-pressed") === "true");
  if (!selected) {
    status.textContent = "Choose a canvas clearing effect first.";
    return;
  }
  const effect = selected.dataset.clearEffect;
  rememberSelectedClearEffect(effect);
  clearDialog.close();
  playClearEffect(effect, selected.querySelector("strong").textContent);
});

newProjectButton.addEventListener("click", openNewProjectDialog);
cancelNewProject.addEventListener("click", () => newProjectDialog.close());
newProjectDialog.addEventListener("click", (event) => {
  if (event.target === newProjectDialog) newProjectDialog.close();
});
newProjectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const width = Number(newProjectWidth.value);
  const height = Number(newProjectHeight.value);
  const name = newProjectName.value.trim();
  if (!name || !Number.isInteger(width) || !Number.isInteger(height) ||
      width < 256 || width > 8192 || height < 256 || height > 8192) {
    status.textContent = "Enter a name and canvas dimensions between 256 and 8192 pixels.";
    return;
  }
  try {
    activeProjectId = createId("project");
    activeProjectName = name;
    activeProjectDimensions = { width, height };
    activeProjectInfinite = newProjectInfinite;
    activeProjectThumbnail = null;
    restoreProjectNotes(null);
    setNotesVisible(false);
    const layerId = createId("layer");
    drawing.loadState({
      layers: [{ id: layerId, name: "Layer 1", visible: true, locked: false, opacity: 1, items: [] }],
      activeLayerId: layerId,
      transparentCanvas: selectedCanvasBackground === "transparent",
      infiniteCanvas: newProjectInfinite,
      backgroundColor: newProjectBackground.value,
    });
    drawing.setImageAssets(assets.filter((asset) => !asset.assetKind));
    newProjectDialog.close();
    setGalleryVisible(false);
    document.querySelector(".app-shell").classList.toggle("is-infinite", newProjectInfinite);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    applyCanvasAspectRatio();
    drawing.resize();
    await saveActiveProject(true);
  } catch (error) {
    announceError("Could not create this artwork", error);
  }
});
for (const preset of document.querySelectorAll("[data-canvas-preset]")) {
  preset.addEventListener("click", () => {
    if (preset.dataset.canvasPreset === "infinite") {
      newProjectInfinite = true;
      infinitePresetButton.setAttribute("aria-pressed", "true");
      newProjectWidth.value = "2048";
      newProjectHeight.value = "2048";
      newProjectWidth.disabled = true;
      newProjectHeight.disabled = true;
      updateBackgroundPreset("transparent");
      return;
    }
    newProjectInfinite = false;
    infinitePresetButton.setAttribute("aria-pressed", "false");
    newProjectWidth.disabled = false;
    newProjectHeight.disabled = false;
    const dimensions = preset.dataset.canvasPreset === "portrait" ? [2048, 2732]
      : preset.dataset.canvasPreset === "landscape" ? [2732, 2048] : [2048, 2048];
    newProjectWidth.value = String(dimensions[0]);
    newProjectHeight.value = String(dimensions[1]);
  });
}
projectSearch.addEventListener("input", () => {
  renderProjectGallery().catch((error) => announceError("Could not search artwork", error));
});
gridViewButton.addEventListener("click", () => {
  galleryLayout = "grid";
  gridViewButton.setAttribute("aria-pressed", "true");
  listViewButton.setAttribute("aria-pressed", "false");
  renderProjectGallery().catch((error) => announceError("Could not change gallery layout", error));
});
listViewButton.addEventListener("click", () => {
  galleryLayout = "list";
  listViewButton.setAttribute("aria-pressed", "true");
  gridViewButton.setAttribute("aria-pressed", "false");
  renderProjectGallery().catch((error) => announceError("Could not change gallery layout", error));
});
galleryThemeButton.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});
async function returnToGallery() {
  try {
    await persistActiveProject(true);
    await renderProjectGallery();
    setGalleryVisible(true);
  } catch (error) {
    announceError("Could not save artwork before returning to the gallery", error);
  }
}
backToGalleryButton.addEventListener("click", returnToGallery);

saveSceneButton.addEventListener("click", async () => {
  const isOpen = !saveMenu.hidden;
  saveMenu.hidden = isOpen;
  saveSceneButton.setAttribute("aria-expanded", String(!isOpen));
});

for (const button of saveFormatButtons) {
  button.addEventListener("click", async () => {
    saveMenu.hidden = true;
    saveSceneButton.setAttribute("aria-expanded", "false");
    workspaceActionsMenu.hidden = true;
    workspaceActionsToggle.setAttribute("aria-expanded", "false");
    try {
      if (button.dataset.saveFormat === "goof") {
        await drawing.saveScene();
        status.textContent = "Editable GOOF scene saved.";
      } else if (button.dataset.saveFormat === "project") {
        await saveActiveProject(true);
      } else if (button.dataset.saveFormat === "png") {
        await drawing.exportPng(activeProjectDimensions.width, activeProjectDimensions.height);
        status.textContent = "PNG drawing downloaded.";
      } else if (button.dataset.saveFormat === "svg") {
        await drawing.exportSvg(activeProjectDimensions.width, activeProjectDimensions.height);
        status.textContent = "SVG scene exported.";
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
    activeProjectId = null;
    activeProjectName = file.name.replace(/\.(goof|json)$/i, "") || "Imported scene";
    activeProjectDimensions = { width: Math.round(drawing.width) || 2048, height: Math.round(drawing.height) || 2048 };
    restoreProjectNotes(null);
    setNotesVisible(false);
    setGalleryVisible(false);
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

async function addDroppedImageAsset(asset, point) {
  if (activeAssetFilter !== "all") setAssetFilter("all", false);
  const layer = drawing.addLayer(asset.name || "Dropped image");
  const placed = asset.assetKind === "scene-item"
    ? drawing.addSavedItem(asset, point)
    : await drawing.addImage(asset, point);
  if (!placed) {
    throw new Error(`Could not add "${asset.name}" to its new layer.`);
  }
  selectTool("select");
  status.textContent = `Added ${asset.name} to a new layer.`;
}

canvas.addEventListener("dragover", (event) => {
  const types = event.dataTransfer?.types ?? [];
  if (!types.includes("Files") && !types.includes("text/asset-id") &&
      !types.includes("application/x-goof-asset-id")) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  canvas.classList.add("image-drop-target");
});
canvas.addEventListener("dragleave", (event) => {
  if (!canvas.contains(event.relatedTarget)) canvas.classList.remove("image-drop-target");
});
canvas.addEventListener("drop", async (event) => {
  const transfer = event.dataTransfer;
  canvas.classList.remove("image-drop-target");
  if (!transfer) return;
  const assetId = transfer.getData("application/x-goof-asset-id") ||
    transfer.getData("text/asset-id");
  const point = drawing.normalizedPoint(event);
  event.preventDefault();
  try {
    if (assetId) {
      const asset = assets.find((entry) => entry.id === assetId);
      if (!asset || assetType(asset) !== "image") {
        status.textContent = "Only image assets can be dropped onto the canvas.";
        return;
      }
      await addDroppedImageAsset(asset, point);
      return;
    }
    const files = Array.from(transfer.files ?? []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (!imageFiles.length) {
      status.textContent = "Drop a supported image file or an image from Assets.";
      return;
    }
    for (const [index, file] of imageFiles.entries()) {
      const asset = {
        id: createId("asset"),
        name: file.name || "Dropped image",
        blob: file,
        createdAt: Date.now(),
        collectionId: null,
      };
      await saveImageAsset(asset);
      await refreshAssets();
      await addDroppedImageAsset(asset, {
        x: Math.max(0, Math.min(1, point.x + index * 0.025)),
        y: Math.max(0, Math.min(1, point.y + index * 0.025)),
      });
    }
  } catch (error) {
    announceError("Could not add the dropped image", error);
  }
});

addLayerButton.addEventListener("click", () => {
  const layer = drawing.addLayer();
  status.textContent = `Added ${layer.name}.`;
});
saveLayerAssetsButton.addEventListener("click", async () => {
  try {
    await saveActiveLayerToAssets();
  } catch (error) {
    announceError("Could not save items to Assets", error);
  }
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
  const canvasContainer = document.querySelector(".canvas-container");
  canvasContainer.classList.toggle("is-transparent", drawing.transparentCanvas);
  canvasContainer.style.backgroundColor = drawing.transparentCanvas
    ? "transparent"
    : drawing.backgroundColor;
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
drawing.onContextMenu = ({ clientX, clientY, selectedItems: items }) => {
  const canEdit = items.length === 1 && !items[0].locked && ["shape", "text"].includes(items[0].type);
  queueMicrotask(() => {
    objectContextMenu.querySelector('[data-object-action="edit"]').hidden = !canEdit;
    objectContextMenu.hidden = false;
    objectContextMenu.style.left = "0px";
    objectContextMenu.style.top = "0px";
    const bounds = objectContextMenu.getBoundingClientRect();
    objectContextMenu.style.left = `${Math.max(8, Math.min(clientX, window.innerWidth - bounds.width - 8))}px`;
    objectContextMenu.style.top = `${Math.max(8, Math.min(clientY, window.innerHeight - bounds.height - 8))}px`;
  });
};
objectContextMenu.addEventListener("click", (event) => {
  const action = event.target.closest("[data-object-action]")?.dataset.objectAction;
  if (!action) return;
  const selected = drawing.getSelectedItems();
  if (action === "duplicate") {
    if (drawing.duplicateSelectedItems()) status.textContent = `Duplicated ${selected.length} selected ${selected.length === 1 ? "object" : "objects"}.`;
    else status.textContent = "There is no room beside the selected objects to place a duplicate.";
  } else if (action === "delete") {
    drawing.deleteSelectedItem();
  } else if (action === "edit" && selected.length === 1) {
    if (selected[0].type === "text") openTextDialog(selected[0]);
    else if (selected[0].type === "shape") openShapePropertiesDialog(selected[0]);
  }
  objectContextMenu.hidden = true;
});
document.addEventListener("pointerdown", (event) => {
  if (!objectContextMenu.hidden && !objectContextMenu.contains(event.target)) {
    objectContextMenu.hidden = true;
  }
});
window.addEventListener("resize", () => {
  objectContextMenu.hidden = true;
  if (!workspaceScreen.hidden) {
    requestAnimationFrame(() => {
      applyCanvasAspectRatio();
      drawing.resize();
    });
  }
});
drawing.onShapeCreated = () => selectTool("select");
drawing.onStrokeEnd = () => {
  status.textContent = "Stroke added to canvas.";
};
drawing.onPointerDown = () => {
  drawing.setBrush({
    color: colorInput.value,
    size: Number(sizeInput.value),
    opacity: Number(opacityInput.value) / 100,
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
    const missingFeatures = [];
    if (typeof wasm.effective_brush_width === "function") {
      drawing.setWidthCalculator(wasm.effective_brush_width);
    } else {
      missingFeatures.push("Rust brush sizing");
    }
    if (typeof wasm.parse_markdown === "function") {
      markdownParser = wasm.parse_markdown;
    } else {
      missingFeatures.push("Rust Notes preview");
    }
    if (notesMode === "preview") renderNotesPreview();
    status.textContent = missingFeatures.length
      ? `Rust/WASM loaded, but ${missingFeatures.join(" and ")} is unavailable. Rebuild the Rust package.`
      : "Rust/WASM brush sizing and Notes preview are ready.";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown WASM initialization error.";
    markdownParser = null;
    if (notesMode === "preview") renderNotesPreview();
    status.textContent = `Rust/WASM is unavailable; using standard brush sizing and the built-in Markdown Notes preview. (${message})`;
    console.warn("Rust/WASM features could not be initialized.", error);
  }
}

async function initializeLibrary() {
  setGalleryVisible(true);
  const galleryLoad = renderProjectGallery().catch((error) => {
    announceError("Could not load artwork", error);
  });
  const assetsLoad = refreshAssets()
    .then(() => {
      autosaveEnabled = true;
    })
    .catch((error) => {
      announceError("Could not load local assets; drawing is still available", error);
    });
  await Promise.all([galleryLoad, assetsLoad]);
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
  Promise.all([persistAutosave(), persistActiveProject()])
    .catch((error) => console.error("Could not save the drawing before closing.", error));
});

const appCommands = [
  { label: "Brush tool", keywords: "paint draw B", shortcut: "B", run: () => selectTool("brush") },
  { label: "Eraser tool", keywords: "delete erase E", shortcut: "E", run: () => selectTool("eraser") },
  { label: "Select and transform", keywords: "selection move resize S", shortcut: "S", run: () => selectTool("select") },
  { label: "Rectangle tool", keywords: "shape box R", shortcut: "R", run: () => { drawing.shapeKind = "rectangle"; updateShapeTool(); selectTool("shapes"); } },
  ...shapes.filter(([kind]) => kind !== "rectangle").map(([kind, label]) => ({
    label: `${label} shape`,
    keywords: `shape ${kind} draw`,
    run: () => { drawing.shapeKind = kind; updateShapeTool(); selectTool("shapes"); },
  })),
  { label: "Fill tool", keywords: "bucket colour F", shortcut: "F", run: () => selectTool("fill") },
  { label: "Open brush library", keywords: "brush style tip crayon airbrush", run: () => openToolSettings("brush") },
  ...brushKinds.map(([kind, label]) => ({
    label: `${label} brush`,
    keywords: `brush style ${kind}`,
    run: () => {
      brushKindInput.value = kind;
      drawing.setBrush({ kind });
      updateBrushTool();
      selectTool("brush");
    },
  })),
  { label: "Choose brush colour", keywords: "color colour picker hue palette", run: () => {
    openToolSettings("brush");
    requestAnimationFrame(() => document.querySelector("#brush-color-trigger").click());
  } },
  { label: "Open eraser settings", keywords: "eraser size", run: () => openToolSettings("eraser") },
  { label: "Show Layers", keywords: "layer panel", shortcut: "L", run: () => setWorkspacePanel("layers") },
  { label: "Show Assets", keywords: "library images stickers", shortcut: "A", run: () => setWorkspacePanel("assets") },
  { label: "Show Artwork Notes", keywords: "notes markdown editor", shortcut: "N", run: () => setNotesVisible(true) },
  { label: "Toggle Notes Vim mode", keywords: "vim neovim vi modal editing normal insert CRT amber green", run: () => setNotesNeovimMode(!vimModeEnabled) },
  { label: "Edit Artwork Notes", keywords: "notes write edit", run: () => { setNotesVisible(true); setNotesMode("edit"); } },
  { label: "Preview Artwork Notes", keywords: "notes markdown preview", shortcut: "Ctrl+E", run: () => { setNotesVisible(true); setNotesMode("preview"); } },
  { label: "Search in notes", keywords: "find note text", shortcut: "Ctrl+O", run: () => openCommandPalette({ searchNotes: true }) },
  { label: "Save current note", keywords: "notes save plain text markdown", run: () => {
    if (notesPanel.hidden) setNotesVisible(true);
    notesSaveMenu.hidden = false;
    notesSaveButton.setAttribute("aria-expanded", "true");
    savedNotesPopover.hidden = true;
    savedNotesToggle.setAttribute("aria-expanded", "false");
  } },
  { label: "Show Saved Notes", keywords: "notes library saved", run: () => {
    if (notesPanel.hidden) setNotesVisible(true);
    savedNotesPopover.hidden = false;
    notesSaveMenu.hidden = true;
    notesSaveButton.setAttribute("aria-expanded", "false");
    savedNotesToggle.setAttribute("aria-expanded", "true");
    renderSavedNotesPopover().catch((error) => {
      savedNotesPopover.hidden = true;
      savedNotesToggle.setAttribute("aria-expanded", "false");
      announceError("Could not load saved notes", error);
    });
  } },
  { label: "Add text to canvas", keywords: "text type", shortcut: "T", run: () => addTextButton.click() },
  { label: "Add image", keywords: "picture photo", run: () => addImageButton.click() },
  { label: "Add layer", keywords: "new layer", run: () => addLayerButton.click() },
  { label: "Undo", keywords: "history back", shortcut: "Ctrl+Z", run: () => drawing.undo() },
  { label: "Redo", keywords: "history forward", shortcut: "Ctrl+Shift+Z", run: () => drawing.redo() },
  { label: "Clear Canvas", keywords: "remove clear artwork", shortcut: "C", run: () => clearButton.click() },
  { label: "Show keyboard shortcuts", keywords: "hotkeys keys keyboard help", run: () => hotkeysDialog.showModal() },
  { label: "Save or export artwork", keywords: "png svg goof scene", run: () => saveSceneButton.click() },
  { label: "Export PNG", keywords: "download image", run: () => { saveSceneButton.click(); document.querySelector('[data-save-format="png"]').click(); } },
  { label: "Open GOOF scene", keywords: "import project file", run: () => openSceneButton.click() },
  { label: "Switch light/dark theme", keywords: "appearance theme", run: () => themeButton.click() },
  { label: "Toggle fullscreen", keywords: "full screen", run: () => fullscreenButton.click() },
  { label: "Home", keywords: "projects gallery artworks", run: () => backToGalleryButton.click() },
  { label: "About GOOF", keywords: "information about", run: () => aboutButton.click() },
];
let matchingCommands = [];
let selectedCommandIndex = 0;
let commandPaletteMode = "commands";
let notesSearchMatches = [];

function renderCommandResults(query = "") {
  if (commandPaletteMode === "notes") {
    const search = query.trim().toLocaleLowerCase();
    notesSearchMatches = [];
    commandPaletteResults.replaceChildren();
    if (!search) {
      const empty = document.createElement("li");
      empty.className = "command-palette-empty";
      empty.textContent = "Type to search this artwork’s notes.";
      commandPaletteResults.append(empty);
      return;
    }
    const title = notesTitleInput.value.trim();
    const titleMatch = title.toLocaleLowerCase().indexOf(search);
    if (titleMatch >= 0) {
      notesSearchMatches.push({
        field: "title",
        start: titleMatch,
        end: titleMatch + search.length,
        line: "Title",
        text: title,
      });
    }
    let offset = 0;
    const lines = notesContentInput.value.split(/\r?\n/);
    for (const [lineIndex, line] of lines.entries()) {
      const lowered = line.toLocaleLowerCase();
      let matchIndex = lowered.indexOf(search);
      while (matchIndex >= 0 && notesSearchMatches.length < 100) {
        notesSearchMatches.push({
          field: "content",
          start: offset + matchIndex,
          end: offset + matchIndex + search.length,
          line: lineIndex + 1,
          text: line.trim() || "(blank line)",
        });
        matchIndex = lowered.indexOf(search, matchIndex + search.length);
      }
      offset += line.length + 1;
    }
    if (!notesSearchMatches.length) {
      const empty = document.createElement("li");
      empty.className = "command-palette-empty";
      empty.textContent = "No matching lines in this note.";
      commandPaletteResults.append(empty);
      return;
    }
    selectedCommandIndex = Math.min(selectedCommandIndex, notesSearchMatches.length - 1);
    notesSearchMatches.forEach((match, index) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", String(index === selectedCommandIndex));
      button.dataset.noteMatchIndex = String(index);
      const label = document.createElement("span");
      label.textContent = match.text;
      const lineNumber = document.createElement("kbd");
      lineNumber.textContent = `Line ${match.line}`;
      button.append(label, lineNumber);
      item.append(button);
      commandPaletteResults.append(item);
    });
    return;
  }
  const searchTerms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  matchingCommands = appCommands.filter((command) =>
    searchTerms.every((term) =>
      `${command.label} ${command.keywords}`.toLocaleLowerCase().includes(term)));
  selectedCommandIndex = Math.min(selectedCommandIndex, Math.max(0, matchingCommands.length - 1));
  commandPaletteResults.replaceChildren();
  if (!matchingCommands.length) {
    const empty = document.createElement("li");
    empty.className = "command-palette-empty";
    empty.textContent = "No matching commands.";
    commandPaletteResults.append(empty);
    return;
  }
  matchingCommands.forEach((command, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(index === selectedCommandIndex));
    button.dataset.commandIndex = String(index);
    const label = document.createElement("span");
    label.textContent = command.label;
    button.append(label);
    if (command.shortcut) {
      const shortcut = document.createElement("kbd");
      shortcut.textContent = command.shortcut;
      button.append(shortcut);
    }
    item.append(button);
    commandPaletteResults.append(item);
  });
}

function openCommandPalette({ searchNotes = false } = {}) {
  if (!commandPalette.open) commandPalette.showModal();
  commandPaletteMode = searchNotes ? "notes" : "commands";
  commandPalette.classList.toggle("is-notes-search", searchNotes);
  commandPalette.dataset.mode = commandPaletteMode;
  commandPaletteSearch.placeholder = searchNotes ? "Find text in this note…" : "Type a tool or action…";
  commandPaletteSearch.value = "";
  selectedCommandIndex = 0;
  renderCommandResults();
  commandPaletteSearch.focus();
  updateNotesSearchCaret();
  requestAnimationFrame(updateNotesSearchCaret);
}

function updateNotesSearchCaret() {
  if (!commandPalette.open || commandPaletteMode !== "notes" ||
      document.activeElement !== commandPaletteSearch) {
    notesSearchCaret.hidden = true;
    return;
  }
  positionBlockCaret(commandPaletteSearch, notesSearchCaret);
}

function updateSelectedCommand(index) {
  selectedCommandIndex = index;
  commandPaletteResults.querySelectorAll('[role="option"]').forEach((option, optionIndex) => {
    option.setAttribute("aria-selected", String(optionIndex === index));
  });
}

function runSelectedCommand(index = selectedCommandIndex) {
  if (commandPaletteMode === "notes") {
    const match = notesSearchMatches[index];
    if (!match) return;
    commandPalette.close();
    setNotesVisible(true);
    setNotesMode("edit");
    requestAnimationFrame(() => {
      const editor = match.field === "title" ? notesTitleInput : notesContentInput;
      editor.focus();
      editor.setSelectionRange(match.start, match.end);
    });
    return;
  }
  const command = matchingCommands[index];
  if (!command) return;
  commandPalette.close();
  command.run();
}

openCommandPaletteButton.addEventListener("click", openCommandPalette);
commandPaletteSearch.addEventListener("input", () => {
  selectedCommandIndex = 0;
  renderCommandResults(commandPaletteSearch.value);
  updateNotesSearchCaret();
});
for (const eventName of ["click", "keyup", "select", "focus", "blur", "scroll"]) {
  commandPaletteSearch.addEventListener(eventName, updateNotesSearchCaret);
}
commandPalette.addEventListener("close", updateNotesSearchCaret);
commandPaletteSearch.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const resultCount = commandPaletteMode === "notes"
      ? notesSearchMatches.length
      : matchingCommands.length;
    if (resultCount) {
      const direction = event.key === "ArrowDown" ? 1 : -1;
      selectedCommandIndex = (selectedCommandIndex + direction + resultCount) % resultCount;
      renderCommandResults(commandPaletteSearch.value);
      commandPaletteResults.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
    }
  } else if (event.key === "Enter") {
    event.preventDefault();
    runSelectedCommand();
  }
});
commandPaletteResults.addEventListener("pointermove", (event) => {
  const noteButton = event.target.closest("[data-note-match-index]");
  if (noteButton) {
    updateSelectedCommand(Number(noteButton.dataset.noteMatchIndex));
    return;
  }
  const button = event.target.closest("[data-command-index]");
  if (!button) return;
  updateSelectedCommand(Number(button.dataset.commandIndex));
});
commandPaletteResults.addEventListener("click", (event) => {
  const noteButton = event.target.closest("[data-note-match-index]");
  if (noteButton) {
    runSelectedCommand(Number(noteButton.dataset.noteMatchIndex));
    return;
  }
  const button = event.target.closest("[data-command-index]");
  if (button) runSelectedCommand(Number(button.dataset.commandIndex));
});
commandPalette.addEventListener("click", (event) => {
  if (event.target === commandPalette) commandPalette.close();
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  if (event.defaultPrevented) return;
  const modifier = event.ctrlKey || event.metaKey;
  if (modifier && event.key.toLowerCase() === "o" && !commandPalette.open) {
    event.preventDefault();
    openCommandPalette({ searchNotes: true });
    return;
  }
  if (modifier && event.shiftKey && event.key.toLowerCase() === "p") {
    event.preventDefault();
    openCommandPalette();
    return;
  }
  const isEditing = target instanceof HTMLElement &&
    (target.isContentEditable || target.matches("input, textarea, select"));
  if ((event.key === "/" || event.key === "`" || event.code === "Backquote") &&
      !modifier && !event.altKey && !isEditing) {
    event.preventDefault();
    openCommandPalette();
    return;
  }
  if (event.key === "Escape" && commandPalette.open) {
    commandPalette.close();
    return;
  }
  if (modifier && event.key.toLowerCase() === "e" &&
      !notesPanel.hidden &&
      (notesPanel.contains(target) || target === document.body)) {
    event.preventDefault();
    toggleNotesEditPreview();
    return;
  }
  if (event.key === "Escape" && !notesPanel.hidden && !commandPalette.open) {
    setNotesVisible(false);
    notesToggle.focus();
    return;
  }
  if (event.key === "Escape" && !objectContextMenu.hidden) {
    objectContextMenu.hidden = true;
    return;
  }
  const modalOpen = textDialog.open || collectionDialog.open || layerDialog.open ||
    shapeDialog.open || aboutDialog.open || shapePropertiesDialog.open || commandPalette.open ||
    hotkeysDialog.open;
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
  if (!modifier && !event.altKey && !event.repeat) {
    const shortcut = event.key.toLowerCase();
    const toolShortcuts = {
      b: () => selectTool("brush"),
      e: () => selectTool("eraser"),
      s: () => selectTool("select"),
      f: () => selectTool("fill"),
      t: () => addTextButton.click(),
      l: () => setWorkspacePanel("layers"),
      a: () => setWorkspacePanel("assets"),
      n: () => setNotesVisible(true),
      c: () => clearButton.click(),
      r: () => {
        drawing.shapeKind = "rectangle";
        updateShapeTool();
        selectTool("shapes");
      },
    };
    if (toolShortcuts[shortcut]) {
      event.preventDefault();
      toolShortcuts[shortcut]();
      return;
    }
  }
  if (modifier && event.key.toLowerCase() === "a" &&
      (target === canvas || document.activeElement === canvas)) {
    event.preventDefault();
    selectTool("select");
    const selected = drawing.selectAllItems();
    status.textContent = selected
      ? `Selected all ${selected} objects on the canvas. Drag, resize, or rotate the group.`
      : "There are no unlocked visible canvas objects to select.";
  } else if (modifier && event.key.toLowerCase() === "d" && drawing.selectedItemIds.length) {
    event.preventDefault();
    if (drawing.duplicateSelectedItems()) status.textContent = "Duplicated the selected objects.";
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
const aboutSignal = initAboutSignal(aboutSignalCanvas, aboutDialog);
initGalleryWeb(document.querySelector("#gallery-web-canvas"), document.querySelector("#gallery-screen"));
void initializeWasmBrushWidth();
void initializeLibrary();
