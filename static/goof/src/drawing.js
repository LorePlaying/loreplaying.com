const BACKGROUND_COLOR = "#ffffff";
const SNAP_DISTANCE = 8;

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function offsetItem(item, deltaX, deltaY) {
  if (Number.isFinite(item.x)) item.x += deltaX;
  if (Number.isFinite(item.y)) item.y += deltaY;
  for (const key of ["points", "curvePoints"]) {
    if (!Array.isArray(item[key])) continue;
    item[key] = item[key].map((point) => ({
      x: point.x + deltaX,
      y: point.y + deltaY,
    }));
  }
}

function createLayer(index) {
  return {
    id: createId("layer"),
    name: `Layer ${index + 1}`,
    visible: true,
    locked: false,
    opacity: 1,
    items: [],
  };
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("The browser could not encode a library image."));
      }
    }, { once: true });
    reader.addEventListener("error", () => {
      reject(reader.error ?? new Error("Could not read a library image."));
    }, { once: true });
    reader.readAsDataURL(blob);
  });
}

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&apos;",
  })[character]);
}

export class DrawingCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.layers = [createLayer(0)];
    this.activeLayerId = this.layers[0].id;
    this.selectedItemId = null;
    this.selectedItemIds = [];
    this.hoveredItemId = null;
    this.activePointerId = null;
    this.interaction = null;
    this.guides = { x: null, y: null };
    this.pan = { x: 0, y: 0 };
    this.spacePan = false;
    this.touchPointers = new Map();
    this.touchTapCandidate = null;
    this.lastTouchTap = null;
    this.transparentCanvas = false;
    this.infiniteCanvas = false;
    this.backgroundColor = BACKGROUND_COLOR;
    this.undoStack = [];
    this.redoStack = [];
    this.width = 0;
    this.height = 0;
    this.brush = { color: "#34314a", size: 6, opacity: 1, tool: "brush", shape: "round", kind: "brush" };
    this.zoom = 1;
    this.itemTypeFilter = "all";
    this.shapeKind = "rectangle";
    this.shapeFill = false;
    this.shapeStroke = true;
    this.fillMode = "smart";
    this.widthCalculator = (size) => size;
    this.imageAssets = new Map();
    this.imageCache = new Map();
    this.imageUrls = new Map();
    this.onPointerDown = () => {};
    this.onFill = () => {};
    this.onStrokeEnd = () => {};
    this.onChange = () => {};
    this.onSelectionChange = () => {};
    this.onEditText = () => {};
    this.onEditShape = () => {};
    this.onHistoryChange = () => {};
    this.onZoomChange = () => {};
    this.onShapeCreated = () => {};
    this.onContextMenu = () => {};
    this.shapeSides = 6;

    if (!this.context) {
      throw new Error("A 2D canvas context is not available.");
    }
    this.layerCanvas = document.createElement("canvas");
    this.layerContext = this.layerCanvas.getContext("2d");
    if (!this.layerContext) {
      throw new Error("A 2D canvas context is not available for layer rendering.");
    }

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas.parentElement ?? canvas);
    window.addEventListener("resize", () => this.resize());
    canvas.addEventListener("pointerdown", (event) => this.startPointer(event));
    canvas.addEventListener("pointermove", (event) => this.movePointer(event));
    canvas.addEventListener("pointerup", (event) => this.endPointer(event));
    canvas.addEventListener("pointercancel", (event) => this.endPointer(event));
    canvas.addEventListener("lostpointercapture", (event) => this.endPointer(event));
    canvas.addEventListener("pointerleave", () => {
      if (this.activePointerId !== null || !this.hoveredItemId) return;
      this.hoveredItemId = null;
      this.canvas.classList.remove("object-hovered", "resize-hovered", "rotate-hovered");
      this.render();
    });
    canvas.addEventListener("dblclick", (event) => this.editTextAtPointer(event));
    canvas.addEventListener("contextmenu", (event) => {
      const point = this.normalizedPoint(event);
      const hit = this.hitTest(point, { includeLocked: true });
      if (!hit) return;
      event.preventDefault();
      this.openContextMenu(event, hit);
    });

    this.resize();
  }

  setBrush({ color = this.brush.color, size = this.brush.size, opacity = this.brush.opacity, tool = this.brush.tool, shape = this.brush.shape, kind = this.brush.kind }) {
    this.brush = { color, size, opacity: Math.max(0, Math.min(1, opacity)), tool, shape, kind };
  }

  setPanMode(active) {
    this.spacePan = active;
    this.canvas.classList.toggle("pan-active", active);
  }

  setBackgroundColor(color) {
    if (!/^#[\da-f]{6}$/i.test(color)) {
      throw new Error("Canvas background color must be a six-digit hex color.");
    }
    if (this.backgroundColor === color && !this.transparentCanvas) {
      return false;
    }
    this.recordHistory();
    this.backgroundColor = color;
    this.transparentCanvas = false;
    this.render();
    this.notifyChange();
    return true;
  }

  setInfiniteCanvas(enabled) {
    this.infiniteCanvas = enabled === true;
    if (this.infiniteCanvas) this.transparentCanvas = true;
    this.render();
    this.notifyChange();
  }

  updateShapeStyle(id, { fill, fillColor, color, stroke, strokeWidth } = {}) {
    const found = this.findItem(id);
    if (!found || found.item.type !== "shape" || found.layer.locked) {
      return false;
    }
    this.recordHistory();
    if (typeof fill === "boolean") found.item.fill = fill;
    if (typeof stroke === "boolean") found.item.stroke = stroke;
    if (typeof fillColor === "string" && /^#[\da-f]{6}$/i.test(fillColor)) found.item.fillColor = fillColor;
    if (typeof color === "string" && /^#[\da-f]{6}$/i.test(color)) found.item.color = color;
    if (Number.isFinite(strokeWidth)) found.item.strokeWidth = Math.max(0.5, Math.min(24, strokeWidth));
    this.render();
    this.notifyChange();
    return true;
  }

  applyViewTransform(context) {
    if (this.zoom === 1 && this.pan.x === 0 && this.pan.y === 0) return;
    context.translate(this.width / 2 + this.pan.x, this.height / 2 + this.pan.y);
    context.scale(this.zoom, this.zoom);
    context.translate(-this.width / 2, -this.height / 2);
  }

  pointForItem(point, item, center = null) {
    const rotation = (item.rotation ?? 0) * Math.PI / 180;
    if (!rotation) return point;
    const bounds = this.itemBounds(item);
    const origin = center ?? { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const dx = point.x - origin.x;
    const dy = point.y - origin.y;
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);
    return { x: origin.x + dx * cosine + dy * sine, y: origin.y - dx * sine + dy * cosine };
  }

  withItemRotation(context, item) {
    const bounds = this.itemBounds(item);
    const centerX = (bounds.x + bounds.width / 2) * this.width;
    const centerY = (bounds.y + bounds.height / 2) * this.height;
    context.translate(centerX, centerY);
    context.rotate((item.rotation ?? 0) * Math.PI / 180);
    context.translate(-centerX, -centerY);
  }

  setWidthCalculator(widthCalculator) {
    this.widthCalculator = widthCalculator;
  }

  setImageAssets(assets) {
    const nextAssets = new Map(assets.map((asset) => [asset.id, asset]));
    const referencedIds = new Set(this.layers.flatMap((layer) =>
      layer.items.filter((item) => item.type === "image").map((item) => item.assetId)));
    for (const id of referencedIds) {
      if (!nextAssets.has(id) && this.imageAssets.has(id)) {
        nextAssets.set(id, this.imageAssets.get(id));
      }
    }
    for (const [id, url] of this.imageUrls) {
      if (!nextAssets.has(id)) {
        URL.revokeObjectURL(url);
        this.imageUrls.delete(id);
        this.imageCache.delete(id);
      }
    }
    this.imageAssets = nextAssets;
    this.render();
  }

  loadSceneData(scene) {
    if (scene?.format !== "goof-scene" || scene.version !== 1 ||
        !scene.state || !Array.isArray(scene.state.layers) || !Array.isArray(scene.assets)) {
      throw new Error("This file is not a supported GOOF scene.");
    }
    const assets = scene.assets.map((asset) => {
      if (typeof asset.id !== "string" || typeof asset.name !== "string" ||
          typeof asset.dataUrl !== "string" || !asset.dataUrl.startsWith("data:image/")) {
        throw new Error("The GOOF scene contains an invalid embedded image.");
      }
      return { ...asset, createdAt: Date.now(), collectionId: null };
    });
    for (const url of this.imageUrls.values()) {
      URL.revokeObjectURL(url);
    }
    this.imageAssets.clear();
    this.imageCache.clear();
    this.imageUrls.clear();
    this.setImageAssets(assets);
    this.loadState(scene.state);
  }

  getState() {
    return {
      layers: this.layers.map((layer) => ({
        ...layer,
        items: layer.items.map((item) => ({
          ...item,
          ...(Array.isArray(item.points) ? { points: item.points.map((point) => ({ ...point })) } : {}),
          ...(Array.isArray(item.curvePoints) ? { curvePoints: item.curvePoints.map((point) => ({ ...point })) } : {}),
        })),
      })),
      activeLayerId: this.activeLayerId,
      transparentCanvas: this.transparentCanvas,
      infiniteCanvas: this.infiniteCanvas,
      backgroundColor: this.backgroundColor,
    };
  }

  getLayers() {
    return this.layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      locked: layer.locked,
      opacity: layer.opacity ?? 1,
      itemCount: layer.items.length,
    }));
  }

  getLayerPreviewItems(id) {
    return this.layers.find((layer) => layer.id === id)?.items ?? [];
  }

  loadState(state) {
    if (!state || !Array.isArray(state.layers)) {
      throw new Error("This GOOF scene has an invalid layer list.");
    }

    this.restoreState(state);
    this.undoStack = [];
    this.redoStack = [];
    this.notifyHistoryChange();
    this.notifyChange();
    this.notifySelection();
  }

  restoreState(state) {
    this.layers = state.layers.map((layer, index) => ({
      id: typeof layer.id === "string" ? layer.id : createId("layer"),
      name: typeof layer.name === "string" ? layer.name : `Layer ${index + 1}`,
      visible: layer.visible !== false,
      locked: layer.locked === true,
      opacity: Number.isFinite(layer.opacity) ? Math.max(0, Math.min(1, layer.opacity)) : 1,
      items: Array.isArray(layer.items)
        ? layer.items.filter((item) => ["stroke", "text", "image", "shape"].includes(item.type))
          .map((item) => ({
            ...item,
            ...(Array.isArray(item.points) ? { points: item.points.map((point) => ({ ...point })) } : {}),
            ...(Array.isArray(item.curvePoints) ? { curvePoints: item.curvePoints.map((point) => ({ ...point })) } : {}),
          }))
        : [],
    }));

    if (!this.layers.length) {
      this.layers.push(createLayer(0));
    }

    const requestedLayer = this.layers.find((layer) => layer.id === state.activeLayerId);
    const editableLayer = [...this.layers].reverse().find((layer) => layer.visible && !layer.locked);
    if (requestedLayer?.visible && !requestedLayer.locked) {
      this.activeLayerId = requestedLayer.id;
    } else if (editableLayer) {
      this.activeLayerId = editableLayer.id;
    } else {
      this.activeLayerId = null;
    }
    this.selectedItemId = null;
    this.selectedItemIds = [];
    this.hoveredItemId = null;
    this.transparentCanvas = state.transparentCanvas === true;
    this.infiniteCanvas = state.infiniteCanvas === true;
    this.backgroundColor = typeof state.backgroundColor === "string" && /^#[\da-f]{6}$/i.test(state.backgroundColor)
      ? state.backgroundColor
      : BACKGROUND_COLOR;
    this.guides = { x: null, y: null };
    this.render();
  }

  recordHistory() {
    this.undoStack.push(this.getState());
    if (this.undoStack.length > 100) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.notifyHistoryChange();
  }

  undo() {
    if (!this.undoStack.length) {
      return false;
    }
    this.redoStack.push(this.getState());
    this.restoreState(this.undoStack.pop());
    this.notifyChange();
    this.notifySelection();
    this.notifyHistoryChange();
    return true;
  }

  redo() {
    if (!this.redoStack.length) {
      return false;
    }
    this.undoStack.push(this.getState());
    this.restoreState(this.redoStack.pop());
    this.notifyChange();
    this.notifySelection();
    this.notifyHistoryChange();
    return true;
  }

  addLayer(name = null) {
    this.recordHistory();
    const layer = createLayer(this.layers.length);
    if (typeof name === "string" && name.trim()) layer.name = name.trim().slice(0, 40);
    this.layers.push(layer);
    this.activeLayerId = layer.id;
    this.render();
    this.notifyChange();
    return layer;
  }

  selectLayer(id) {
    if (!this.layers.some((layer) => layer.id === id && layer.visible)) {
      return;
    }
    this.activeLayerId = id;
    this.setSelectedItem(null);
    this.notifyChange();
  }

  toggleLayerVisibility(id) {
    const layer = this.layers.find((entry) => entry.id === id);
    if (!layer) {
      return;
    }
    this.recordHistory();
    layer.visible = !layer.visible;
    if (!layer.visible && this.activeLayerId === id) {
      const editableLayer = [...this.layers].reverse().find((entry) => entry.visible && !entry.locked);
      this.activeLayerId = editableLayer?.id ?? null;
    } else if (layer.visible && !layer.locked && !this.activeLayerId) {
      this.activeLayerId = layer.id;
    }
    if (!layer.visible && this.selectedItemIds.some((id) => layer.items.some((item) => item.id === id))) {
      this.setSelectedItems(this.selectedItemIds.filter((id) => !layer.items.some((item) => item.id === id)));
    }
    this.render();
    this.notifyChange();
  }

  toggleLayerLock(id) {
    const layer = this.layers.find((entry) => entry.id === id);
    if (!layer) {
      return;
    }
    this.recordHistory();
    layer.locked = !layer.locked;
    if (layer.locked && this.activeLayerId === id) {
      const editableLayer = [...this.layers].reverse().find((entry) => !entry.locked && entry.visible);
      this.activeLayerId = editableLayer?.id ?? null;
    } else if (!layer.locked && layer.visible && !this.activeLayerId) {
      this.activeLayerId = layer.id;
    }
    if (layer.locked && this.selectedItemIds.some((id) => layer.items.some((item) => item.id === id))) {
      this.setSelectedItems(this.selectedItemIds.filter((id) => !layer.items.some((item) => item.id === id)));
    }
    this.render();
    this.notifySelection();
    this.notifyChange();
  }

  removeLayer(id) {
    if (this.layers.length <= 1) {
      return false;
    }
    const index = this.layers.findIndex((layer) => layer.id === id);
    if (index < 0) {
      return false;
    }
    this.recordHistory();
    this.layers.splice(index, 1);
    if (this.activeLayerId === id) {
      this.activeLayerId = this.layers[Math.max(0, index - 1)].id;
    }
    if (this.selectedItemIds.some((itemId) => !this.findItem(itemId))) {
      this.setSelectedItems(this.selectedItemIds.filter((itemId) => this.findItem(itemId)));
    }
    this.render();
    this.notifyChange();
    return true;
  }

  moveLayer(id, offset) {
    const index = this.layers.findIndex((layer) => layer.id === id);
    const nextIndex = index + offset;
    if (index < 0 || nextIndex < 0 || nextIndex >= this.layers.length) {
      return false;
    }
    this.recordHistory();
    [this.layers[index], this.layers[nextIndex]] = [this.layers[nextIndex], this.layers[index]];
    this.render();
    this.notifyChange();
    return true;
  }

  reorderLayer(sourceId, targetId) {
    const displayedLayers = [...this.layers].reverse();
    const sourceIndex = displayedLayers.findIndex((layer) => layer.id === sourceId);
    const targetIndex = displayedLayers.findIndex((layer) => layer.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
      return false;
    }
    this.recordHistory();
    const [source] = displayedLayers.splice(sourceIndex, 1);
    displayedLayers.splice(targetIndex, 0, source);
    this.layers = displayedLayers.reverse();
    this.render();
    this.notifyChange();
    return true;
  }

  setLayerOpacity(id, opacity, record = true, notify = true) {
    const layer = this.layers.find((entry) => entry.id === id);
    if (!layer) {
      return;
    }
    const nextOpacity = Math.max(0, Math.min(1, opacity));
    if (layer.opacity === nextOpacity) {
      return;
    }
    if (record) {
      this.recordHistory();
    }
    layer.opacity = nextOpacity;
    this.render();
    if (notify) {
      this.notifyChange();
    }
  }

  updateLayerProperties(id, properties) {
    const layer = this.layers.find((entry) => entry.id === id);
    if (!layer) {
      return false;
    }
    const nextName = properties.name.trim();
    const nextOpacity = Math.max(0, Math.min(1, properties.opacity));
    if (!nextName) {
      throw new Error("A layer name cannot be empty.");
    }
    if (layer.name === nextName && layer.visible === properties.visible &&
        layer.locked === properties.locked && layer.opacity === nextOpacity) {
      return false;
    }

    this.recordHistory();
    layer.name = nextName;
    layer.visible = properties.visible;
    layer.locked = properties.locked;
    layer.opacity = nextOpacity;
    if (!layer.visible || layer.locked) {
      if (this.activeLayerId === id) {
        const editableLayer = [...this.layers].reverse().find((entry) => entry.visible && !entry.locked);
        this.activeLayerId = editableLayer?.id ?? null;
      }
      this.setSelectedItems(this.selectedItemIds.filter((itemId) => {
        const found = this.findItem(itemId);
        return found && found.layer.visible && !found.layer.locked;
      }));
    } else if (!this.activeLayerId) {
      this.activeLayerId = id;
    }
    this.render();
    this.notifySelection();
    this.notifyChange();
    return true;
  }

  toggleTransparentCanvas() {
    this.recordHistory();
    this.transparentCanvas = !this.transparentCanvas;
    this.render();
    this.notifyChange();
  }

  clear() {
    const hasContent = this.layers.some((layer) => layer.items.length);
    const changedBackground = this.backgroundColor !== BACKGROUND_COLOR || this.transparentCanvas;
    if (!hasContent && !changedBackground) return false;
    this.recordHistory();
    for (const layer of this.layers) {
      layer.items = [];
    }
    this.backgroundColor = BACKGROUND_COLOR;
    this.transparentCanvas = false;
    this.setSelectedItem(null);
    this.render();
    this.notifyChange();
    return true;
  }

  addText({ text, color = this.brush.color, fontSize = 32, x = 0.12, y = 0.16 }) {
    const layer = this.activeLayer();
    if (!layer || layer.locked || !layer.visible || !text.trim()) {
      return null;
    }

    this.recordHistory();
    const item = {
      id: createId("text"),
      type: "text",
      text: text.trim(),
      color,
      fontSize: Math.round(Math.max(8, Math.min(120, fontSize))),
      x: this.infiniteCanvas ? x : Math.max(0, Math.min(1, x)),
      y: this.infiniteCanvas ? y : Math.max(0, Math.min(1, y)),
    };
    layer.items.push(item);
    this.setSelectedItem(item.id);
    this.render();
    this.notifyChange();
    return item;
  }

  addSavedItem(asset, point = null) {
    const layer = this.activeLayer();
    if (!layer || layer.locked || !layer.visible || !asset.item) return false;
    if (asset.item.type === "group") {
      const group = structuredClone(asset.item);
      if (!Array.isArray(group.items) || !group.items.length) return false;
      for (const imageAsset of asset.imageAssets ?? []) {
        this.imageAssets.set(imageAsset.id, imageAsset);
      }
      const center = point ?? { x: 0.5, y: 0.5 };
      const deltaX = Math.max(0, Math.min(1 - group.width, center.x - group.width / 2));
      const deltaY = Math.max(0, Math.min(1 - group.height, center.y - group.height / 2));
      const items = group.items.map((entry) => {
        const item = structuredClone(entry);
        item.id = createId(item.type);
        offsetItem(item, deltaX, deltaY);
        return item;
      });
      this.recordHistory();
      layer.items.push(...items);
      this.setSelectedItems(items.map((item) => item.id));
      this.render();
      this.notifyChange();
      return true;
    }
    const item = structuredClone(asset.item);
    item.id = createId(item.type);
    if (item.type === "image") {
      if (!asset.imageAsset) return false;
      this.imageAssets.set(asset.imageAsset.id, asset.imageAsset);
      item.assetId = asset.imageAsset.id;
    }
    const bounds = this.itemBounds(item);
    const center = point ?? { x: 0.5, y: 0.5 };
    item.x = Math.max(0, Math.min(1 - bounds.width, center.x - bounds.width / 2));
    item.y = Math.max(0, Math.min(1 - bounds.height, center.y - bounds.height / 2));
    if (item.type === "stroke" || (item.type === "shape" && item.shape === "freeform")) {
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      item.points = item.points.map((point) => ({
        x: Math.max(0, Math.min(1, point.x + 0.5 - centerX)),
        y: Math.max(0, Math.min(1, point.y + 0.5 - centerY)),
      }));
    }
    if (item.type === "shape" && item.shape === "curve" && Array.isArray(item.curvePoints)) {
      const deltaX = item.x - bounds.x;
      const deltaY = item.y - bounds.y;
      item.curvePoints = item.curvePoints.map((point) => ({
        x: Math.max(0, Math.min(1, point.x + deltaX)),
        y: Math.max(0, Math.min(1, point.y + deltaY)),
      }));
    }
    this.recordHistory();
    layer.items.push(item);
    this.setSelectedItem(item.id);
    this.render();
    this.notifyChange();
    return true;
  }

  setZoom(zoom) {
    this.zoom = Math.max(0.25, Math.min(10, zoom));
    this.render();
    this.onZoomChange(this.zoom);
  }

  setItemTypeFilter(type) {
    if (!["all", "text", "image", "shape", "drawing"].includes(type)) {
      throw new Error(`Unsupported canvas item filter: ${type}`);
    }
    this.itemTypeFilter = type;
    this.hoveredItemId = null;
    this.canvas.classList.remove("object-hovered", "resize-hovered", "rotate-hovered");
    if (type !== "all") {
      const visibleSelection = this.selectedItemIds.filter((id) => {
        const found = this.findItem(id);
        return found && this.itemMatchesType(found.item, type);
      });
      if (visibleSelection.length !== this.selectedItemIds.length) {
        this.setSelectedItems(visibleSelection);
      }
    }
    this.render();
  }

  itemMatchesType(item, type = this.itemTypeFilter) {
    if (type === "all") return true;
    const itemType = item.type === "stroke" ? "drawing" : item.type;
    return itemType === type;
  }

  updateSelectedText({ text, color, fontSize }) {
    const selected = this.findItem(this.selectedItemId);
    if (!selected || selected.item.type !== "text") {
      return false;
    }

    if (!text.trim()) {
      return false;
    }

    this.recordHistory();
    Object.assign(selected.item, {
      text: text.trim(),
      color,
      fontSize: Math.round(Math.max(8, Math.min(120, fontSize))),
    });
    this.render();
    this.notifyChange();
    this.notifySelection();
    return true;
  }

  async addImage(asset, point = null) {
    const layer = this.activeLayer();
    if (!layer || layer.locked || !layer.visible) {
      return null;
    }

    this.imageAssets.set(asset.id, asset);
    const image = await this.loadImage(asset.id);
    const scale = Math.min(
      1,
      420 / image.naturalWidth,
      340 / image.naturalHeight,
      this.width / image.naturalWidth,
      this.height / image.naturalHeight,
    );
    const imageWidth = Math.min(this.width, image.naturalWidth * scale);
    const imageHeight = Math.min(this.height, image.naturalHeight * scale);
    const item = {
      id: createId("image"),
      type: "image",
      assetId: asset.id,
      x: Math.max(0, Math.min(1 - imageWidth / this.width,
        (point?.x ?? 0.5) - imageWidth / this.width / 2)),
      y: Math.max(0, Math.min(1 - imageHeight / this.height,
        (point?.y ?? 0.5) - imageHeight / this.height / 2)),
      width: imageWidth / this.width,
      height: imageHeight / this.height,
      aspectRatio: image.naturalWidth / image.naturalHeight,
    };
    this.recordHistory();
    layer.items.push(item);
    this.setSelectedItem(item.id);
    this.render();
    this.notifyChange();
    return item;
  }

  getSelectedItem() {
    const found = this.findItem(this.selectedItemId);
    return found ? { ...found.item, layerId: found.layer.id, locked: found.layer.locked } : null;
  }

  getSelectedItems() {
    return this.selectedItemIds.flatMap((id) => {
      const found = this.findItem(id);
      return found ? [{
        ...found.item,
        layerId: found.layer.id,
        locked: found.layer.locked,
        visible: found.layer.visible,
      }] : [];
    });
  }

  selectAllItems() {
    const ids = this.layers
      .filter((layer) => layer.visible && !layer.locked)
      .flatMap((layer) => layer.items
        .filter((item) => this.itemMatchesType(item))
        .map((item) => item.id));
    this.setSelectedItems(ids);
    return ids.length;
  }

  transformableSelection() {
    return this.selectedItemIds.flatMap((id) => {
      const found = this.findItem(id);
      return found && found.layer.visible && !found.layer.locked
        ? [{ ...found, bounds: this.itemBounds(found.item) }]
        : [];
    });
  }

  selectionBounds(entries = this.transformableSelection()) {
    if (!entries.length) return null;
    const left = Math.min(...entries.map(({ bounds }) => bounds.x));
    const top = Math.min(...entries.map(({ bounds }) => bounds.y));
    const right = Math.max(...entries.map(({ bounds }) => bounds.x + bounds.width));
    const bottom = Math.max(...entries.map(({ bounds }) => bounds.y + bounds.height));
    return { x: left, y: top, width: right - left, height: bottom - top };
  }

  deleteSelectedItem() {
    const deletable = this.selectedItemIds.flatMap((id) => {
      const found = this.findItem(id);
      return found && !found.layer.locked ? [found] : [];
    });
    if (!deletable.length) {
      return false;
    }
    this.recordHistory();
    for (const { layer, item } of deletable) {
      layer.items.splice(layer.items.indexOf(item), 1);
    }
    this.setSelectedItems([]);
    this.render();
    this.notifyChange();
    return true;
  }

  duplicateSelectedItems() {
    const selected = this.transformableSelection();
    if (!selected.length) return false;
    const bounds = this.selectionBounds(selected);
    const deltaX = Math.min(0.025, Math.max(0, 1 - bounds.x - bounds.width));
    const deltaY = Math.min(0.025, Math.max(0, 1 - bounds.y - bounds.height));
    if (deltaX === 0 && deltaY === 0) return false;
    this.recordHistory();
    const copies = selected.map(({ layer, item }) => {
      const copy = structuredClone(item);
      copy.id = createId(copy.type);
      offsetItem(copy, deltaX, deltaY);
      layer.items.splice(layer.items.indexOf(item) + 1, 0, copy);
      return copy;
    });
    this.setSelectedItems(copies.map((item) => item.id));
    this.render();
    this.notifyChange();
    return true;
  }

  openContextMenu(event, hit) {
    if (!this.selectedItemIds.includes(hit.item.id)) {
      this.setSelectedItems([hit.item.id]);
    }
    if (!hit.layer.locked) this.activeLayerId = hit.layer.id;
    this.onContextMenu({
      clientX: event.clientX,
      clientY: event.clientY,
      selectedItems: this.getSelectedItems(),
    });
  }

  async exportPng(width = this.canvas.width, height = this.canvas.height) {
    if (this.infiniteCanvas) {
      const svg = await this.exportSvg(undefined, undefined, { download: false });
      const svgUrl = URL.createObjectURL(svg);
      try {
        const image = new Image();
        await new Promise((resolve, reject) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", () => reject(new Error("The browser could not render the canvas for PNG export.")), { once: true });
          image.src = svgUrl;
        });
        const output = document.createElement("canvas");
        output.width = Math.max(1, Math.min(8192, image.naturalWidth));
        output.height = Math.max(1, Math.min(8192, image.naturalHeight));
        const outputContext = output.getContext("2d");
        if (!outputContext) {
          throw new Error("A 2D canvas context is not available for PNG export.");
        }
        outputContext.drawImage(image, 0, 0, output.width, output.height);
        const blob = await new Promise((resolve, reject) => {
          output.toBlob((result) => result
            ? resolve(result)
            : reject(new Error("The browser could not create a PNG image.")), "image/png");
        });
        downloadBlob(blob, "goof-doodle.png");
      } finally {
        URL.revokeObjectURL(svgUrl);
      }
      return;
    }

    const imageIds = this.layers.filter((layer) => layer.visible)
      .flatMap((layer) => layer.items.filter((item) => item.type === "image").map((item) => item.assetId));
    await Promise.all([...new Set(imageIds)].map((id) => this.loadImage(id)));

    const output = document.createElement("canvas");
    output.width = Math.max(1, Math.min(8192, Math.round(width)));
    output.height = Math.max(1, Math.min(8192, Math.round(height)));
    const outputContext = output.getContext("2d");
    if (!outputContext) {
      throw new Error("A 2D canvas context is not available for PNG export.");
    }

    outputContext.setTransform(output.width / this.width, 0, 0, output.height / this.height, 0, 0);
    const originalCanvas = this.canvas;
    const originalContext = this.context;
    const originalSelection = this.selectedItemId;
    const originalSelections = this.selectedItemIds;
    const originalHover = this.hoveredItemId;
    const originalGuides = this.guides;
    const originalZoom = this.zoom;
    const originalPan = this.pan;
    this.canvas = output;
    this.context = outputContext;
    this.selectedItemId = null;
    this.selectedItemIds = [];
    this.hoveredItemId = null;
    this.guides = { x: null, y: null };
    this.zoom = 1;
    this.pan = { x: 0, y: 0 };
    try {
      this.render({ ignoreTypeFilter: true });
    } finally {
      this.canvas = originalCanvas;
      this.context = originalContext;
      this.selectedItemId = originalSelection;
      this.selectedItemIds = originalSelections;
      this.hoveredItemId = originalHover;
      this.guides = originalGuides;
      this.zoom = originalZoom;
      this.pan = originalPan;
    }

    const blob = await new Promise((resolve, reject) => {
      output.toBlob((result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("The browser could not create a PNG image."));
        }
      }, "image/png");
    });

    downloadBlob(blob, "goof-doodle.png");
  }

  async exportSvg(width = Math.round(this.width), height = Math.round(this.height), { download = true } = {}) {
    const imageIds = [...new Set(this.layers.filter((layer) => layer.visible).flatMap((layer) =>
      layer.items.filter((item) => item.type === "image").map((item) => item.assetId)))];
    await Promise.all(imageIds.map((id) => this.loadImage(id)));
    const imageData = new Map();
    for (const id of imageIds) {
      const asset = this.imageAssets.get(id);
      imageData.set(id, typeof asset.dataUrl === "string"
        ? asset.dataUrl
        : await blobToDataUrl(asset.blob));
    }
    width = Math.max(1, Math.min(8192, Math.round(width)));
    height = Math.max(1, Math.min(8192, Math.round(height)));
    let viewMinX = 0;
    let viewMinY = 0;
    let viewWidth = width;
    let viewHeight = height;
    if (this.infiniteCanvas) {
      const bounds = this.layers.filter((layer) => layer.visible)
        .flatMap((layer) => layer.items.map((item) => this.itemBounds(item)));
      if (bounds.length) {
        const margin = 32;
        viewMinX = Math.min(...bounds.map((boundsItem) => boundsItem.x * width)) - margin;
        viewMinY = Math.min(...bounds.map((boundsItem) => boundsItem.y * height)) - margin;
        const viewMaxX = Math.max(...bounds.map((boundsItem) => (boundsItem.x + boundsItem.width) * width)) + margin;
        const viewMaxY = Math.max(...bounds.map((boundsItem) => (boundsItem.y + boundsItem.height) * height)) + margin;
        viewWidth = Math.max(1, viewMaxX - viewMinX);
        viewHeight = Math.max(1, viewMaxY - viewMinY);
      }
    }
    const definitions = [];
    const eraserPaths = [];
    const rotateMarkup = (item, markup) => {
      const rotation = Number.isFinite(item.rotation) ? item.rotation : 0;
      if (!rotation) return markup;
      const bounds = this.itemBounds(item);
      const centerX = (bounds.x + bounds.width / 2) * width;
      const centerY = (bounds.y + bounds.height / 2) * height;
      return `<g transform="rotate(${rotation} ${centerX} ${centerY})">${markup}</g>`;
    };
    const layers = this.layers.filter((layer) => layer.visible).map((layer) => {
      let content = "";
      layer.items.forEach((item) => {
        if (item.type === "stroke") {
          const first = item.points[0];
          if (!first) return;
          const markupStart = content.length;
          const path = item.points.map((point, index) =>
            `${index === 0 ? "M" : "L"} ${point.x * width} ${point.y * height}`).join(" ");
          if (item.tool === "eraser") {
            const pathOrPoint = rotateMarkup(item, item.points.length === 1
              ? `<circle cx="${first.x * width}" cy="${first.y * height}" r="${item.size / 2}" fill="black"/>`
              : `<path d="${path}" fill="none" stroke="black" stroke-width="${item.size}" stroke-linecap="round" stroke-linejoin="round"/>`);
            eraserPaths.push(pathOrPoint);
          } else if (item.points.length === 1) {
            if (item.shape === "square") {
              content += `<rect x="${first.x * width - item.size / 2}" y="${first.y * height - item.size / 2}" width="${item.size}" height="${item.size}" fill="${escapeXml(item.color)}"/>`;
            } else {
              content += `<circle cx="${first.x * width}" cy="${first.y * height}" r="${item.size / 2}" fill="${escapeXml(item.color)}"/>`;
            }
          } else {
            const cap = item.shape === "square" ? "square" : "round";
            const join = item.shape === "square" ? "bevel" : "round";
            content += `<path d="${path}" fill="none" stroke="${escapeXml(item.color)}" stroke-width="${item.size}" stroke-linecap="${cap}" stroke-linejoin="${join}"/>`;
          }
          if (item.tool !== "eraser") {
            content = content.slice(0, markupStart) + rotateMarkup(item, content.slice(markupStart));
          }
          return;
        }
        if (item.type === "text") {
          const markupStart = content.length;
          const lines = this.textLines(item.text, Math.max(40, this.width * 0.75));
          content += `<text x="${item.x * width + 6}" y="${item.y * height + 4}" fill="${escapeXml(item.color)}" font-family="Trebuchet MS, Segoe UI, sans-serif" font-size="${item.fontSize}" font-weight="700">${lines.map((line, index) =>
            `<tspan x="${item.x * width + 6}" dy="${index === 0 ? 0 : item.fontSize * 1.3}">${escapeXml(line)}</tspan>`).join("")}</text>`;
          content = content.slice(0, markupStart) + rotateMarkup(item, content.slice(markupStart));
          return;
        }
        if (item.type === "shape") {
          const markupStart = content.length;
          const x = item.x * width;
          const y = item.y * height;
          const shapeWidth = item.width * width;
          const shapeHeight = item.height * height;
          const fill = item.fill && !["line", "curve", "arc", "spiral"].includes(item.shape)
            ? escapeXml(item.fillColor ?? item.color) : "none";
          const stroke = item.stroke === false ? "none" : escapeXml(item.color);
          if (["circle", "oval", "ellipse"].includes(item.shape)) {
            content += `<ellipse cx="${x + shapeWidth / 2}" cy="${y + shapeHeight / 2}" rx="${shapeWidth / 2}" ry="${shapeHeight / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${item.strokeWidth ?? 3}"/>`;
          } else if (item.shape === "line") {
            content += `<path d="M ${x} ${y} L ${x + shapeWidth} ${y + shapeHeight}" fill="none" stroke="${stroke}" stroke-width="${item.strokeWidth ?? 3}"/>`;
          } else if (item.shape === "curve") {
            const points = item.curvePoints ?? [
              { x: item.x, y: item.y + item.height },
              { x: item.x + item.width * 0.25, y: item.y + item.height * 0.05 },
              { x: item.x + item.width * 0.75, y: item.y + item.height * 0.95 },
              { x: item.x + item.width, y: item.y },
            ];
            content += `<path d="M ${points[0].x * width} ${points[0].y * height} C ${points[1].x * width} ${points[1].y * height}, ${points[2].x * width} ${points[2].y * height}, ${points[3].x * width} ${points[3].y * height}" fill="none" stroke="${stroke}" stroke-width="${item.strokeWidth ?? 3}"/>`;
          } else if (item.shape === "polygon") {
            const sides = Math.max(3, Math.min(12, Math.round(item.sides ?? 6)));
            const path = Array.from({ length: sides }, (_, index) => {
              const angle = -Math.PI / 2 + index * Math.PI * 2 / sides;
              const pointX = x + shapeWidth / 2 + Math.cos(angle) * shapeWidth / 2;
              const pointY = y + shapeHeight / 2 + Math.sin(angle) * shapeHeight / 2;
              return `${index === 0 ? "M" : "L"} ${pointX} ${pointY}`;
            }).join(" ") + " Z";
            content += `<path d="${path}" fill="${fill}" stroke="${stroke}" stroke-width="${item.strokeWidth ?? 3}" stroke-linejoin="round"/>`;
          } else if (item.shape === "crescent") {
            content += `<path d="M ${x + shapeWidth * .7} ${y + shapeHeight * .08} C ${x + shapeWidth * .25} ${y + shapeHeight * .08}, ${x + shapeWidth * .16} ${y + shapeHeight * .78}, ${x + shapeWidth * .55} ${y + shapeHeight * .95} C ${x + shapeWidth * .25} ${y + shapeHeight * .66}, ${x + shapeWidth * .45} ${y + shapeHeight * .23}, ${x + shapeWidth * .7} ${y + shapeHeight * .08} Z" fill="${fill}" stroke="${stroke}" stroke-width="${item.strokeWidth ?? 3}"/>`;
          } else if (item.shape === "cloud") {
            content += `<path d="M ${x + shapeWidth * .2} ${y + shapeHeight * .78} C ${x - shapeWidth * .02} ${y + shapeHeight * .78}, ${x - shapeWidth * .02} ${y + shapeHeight * .5}, ${x + shapeWidth * .18} ${y + shapeHeight * .45} C ${x + shapeWidth * .17} ${y + shapeHeight * .1}, ${x + shapeWidth * .57} ${y + shapeHeight * .02}, ${x + shapeWidth * .68} ${y + shapeHeight * .33} C ${x + shapeWidth * .95} ${y + shapeHeight * .25}, ${x + shapeWidth * 1.02} ${y + shapeHeight * .65}, ${x + shapeWidth * .82} ${y + shapeHeight * .78} Z" fill="${fill}" stroke="${stroke}" stroke-width="${item.strokeWidth ?? 3}"/>`;
          } else if (item.shape === "cylinder") {
            content += `<path d="M ${x} ${y + shapeHeight * .16} A ${shapeWidth / 2} ${shapeHeight * .16} 0 1 1 ${x + shapeWidth} ${y + shapeHeight * .16} L ${x + shapeWidth} ${y + shapeHeight * .84} A ${shapeWidth / 2} ${shapeHeight * .16} 0 0 1 ${x} ${y + shapeHeight * .84} Z M ${x} ${y + shapeHeight * .16} V ${y + shapeHeight * .84} M ${x + shapeWidth} ${y + shapeHeight * .16} V ${y + shapeHeight * .84}" fill="${fill}" stroke="${stroke}" stroke-width="${item.strokeWidth ?? 3}"/>`;
          } else if (item.shape === "cube") {
            content += `<path d="M ${x + shapeWidth * .5} ${y} L ${x + shapeWidth} ${y + shapeHeight * .25} V ${y + shapeHeight * .75} L ${x + shapeWidth * .5} ${y + shapeHeight} L ${x} ${y + shapeHeight * .75} V ${y + shapeHeight * .25} Z M ${x} ${y + shapeHeight * .25} L ${x + shapeWidth * .5} ${y + shapeHeight * .5} L ${x + shapeWidth} ${y + shapeHeight * .25} M ${x + shapeWidth * .5} ${y + shapeHeight * .5} V ${y + shapeHeight} M ${x + shapeWidth * .5} ${y + shapeHeight * .5} V ${y}" fill="${fill}" stroke="${stroke}" stroke-width="${item.strokeWidth ?? 3}" stroke-linejoin="round"/>`;
          } else if (item.shape === "spiral") {
            const path = Array.from({ length: 141 }, (_, index) => {
              const progress = index / 140;
              const angle = progress * 3.5 * Math.PI * 2;
              const radius = progress * Math.min(shapeWidth, shapeHeight) * .48;
              const pointX = x + shapeWidth / 2 + Math.cos(angle) * radius;
              const pointY = y + shapeHeight / 2 + Math.sin(angle) * radius;
              return `${index === 0 ? "M" : "L"} ${pointX} ${pointY}`;
            }).join(" ");
            content += `<path d="${path}" fill="none" stroke="${stroke}" stroke-width="${item.strokeWidth ?? 3}"/>`;
          } else if (item.shape === "freeform" && Array.isArray(item.points)) {
            const path = item.points.map((point, index) =>
              `${index === 0 ? "M" : "L"} ${point.x * width} ${point.y * height}`).join(" ");
            content += `<path d="${path} Z" fill="${fill}" stroke="${stroke}" stroke-width="${item.strokeWidth ?? 3}" stroke-linejoin="round"/>`;
          } else {
            const points = {
              triangle: [[.5, 0], [1, 1], [0, 1]],
              "right-triangle": [[0, 0], [0, 1], [1, 1]],
              diamond: [[.5, 0], [1, .5], [.5, 1], [0, .5]],
              pentagon: [[.5, 0], [1, .38], [.81, 1], [.19, 1], [0, .38]],
              hexagon: [[.25, 0], [.75, 0], [1, .5], [.75, 1], [.25, 1], [0, .5]],
              octagon: [[.3, 0], [.7, 0], [1, .3], [1, .7], [.7, 1], [.3, 1], [0, .7], [0, .3]],
              polygon: [[.25, 0], [.75, 0], [1, .5], [.75, 1], [.25, 1], [0, .5]],
              parallelogram: [[.25, 0], [1, 0], [.75, 1], [0, 1]],
              trapezoid: [[.22, 0], [.78, 0], [1, 1], [0, 1]],
              cross: [[.4, 0], [.6, 0], [.6, .4], [1, .4], [1, .6], [.6, .6], [.6, 1], [.4, 1], [.4, .6], [0, .6], [0, .4], [.4, .4]],
              star: [[.5, 0], [.62, .36], [1, .36], [.69, .58], [.81, 1], [.5, .74], [.19, 1], [.31, .58], [0, .36], [.38, .36]],
              arrow: [[0, .3], [.62, .3], [.62, 0], [1, .5], [.62, 1], [.62, .7], [0, .7]],
            }[item.shape];
            if (points) {
              const path = points.map(([px, py], index) =>
                `${index === 0 ? "M" : "L"} ${x + px * shapeWidth} ${y + py * shapeHeight}`).join(" ") + " Z";
              content += `<path d="${path}" fill="${fill}" stroke="${stroke}" stroke-width="${item.strokeWidth ?? 3}" stroke-linejoin="round"/>`;
            } else if (item.shape === "heart") {
              content += `<path d="M ${x + shapeWidth / 2} ${y + shapeHeight} C ${x - shapeWidth * .1} ${y + shapeHeight * .48}, ${x + shapeWidth * .12} ${y - shapeHeight * .12}, ${x + shapeWidth / 2} ${y + shapeHeight * .28} C ${x + shapeWidth * .88} ${y - shapeHeight * .12}, ${x + shapeWidth * 1.1} ${y + shapeHeight * .48}, ${x + shapeWidth / 2} ${y + shapeHeight} Z" fill="${fill}" stroke="${stroke}" stroke-width="${item.strokeWidth ?? 3}"/>`;
            } else if (item.shape === "arc") {
              content += `<path d="M ${x} ${y + shapeHeight / 2} A ${shapeWidth / 2} ${shapeHeight / 2} 0 0 1 ${x + shapeWidth} ${y + shapeHeight / 2}" fill="none" stroke="${stroke}" stroke-width="${item.strokeWidth ?? 3}"/>`;
            } else if (item.shape === "ring") {
              content += `<path d="M ${x + shapeWidth} ${y + shapeHeight / 2} A ${shapeWidth / 2} ${shapeHeight / 2} 0 1 1 ${x} ${y + shapeHeight / 2} A ${shapeWidth / 2} ${shapeHeight / 2} 0 1 1 ${x + shapeWidth} ${y + shapeHeight / 2} M ${x + shapeWidth * .68} ${y + shapeHeight / 2} A ${shapeWidth * .18} ${shapeHeight * .18} 0 1 0 ${x + shapeWidth * .32} ${y + shapeHeight / 2} A ${shapeWidth * .18} ${shapeHeight * .18} 0 1 0 ${x + shapeWidth * .68} ${y + shapeHeight / 2}" fill="${fill}" fill-rule="evenodd" stroke="${stroke}" stroke-width="${item.strokeWidth ?? 3}"/>`;
            } else {
              const radius = item.shape === "rounded-rectangle" ? Math.min(shapeWidth, shapeHeight) * .18 : 0;
              content += `<rect x="${x}" y="${y}" width="${shapeWidth}" height="${shapeHeight}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${item.strokeWidth ?? 3}"/>`;
            }
          }
          content = content.slice(0, markupStart) + rotateMarkup(item, content.slice(markupStart));
          return;
        }
        const dimensions = this.itemSize(item);
        const markupStart = content.length;
        content += `<image href="${escapeXml(imageData.get(item.assetId))}" x="${item.x * width}" y="${item.y * height}" width="${dimensions.width * width}" height="${dimensions.height * height}"/>`;
        content = content.slice(0, markupStart) + rotateMarkup(item, content.slice(markupStart));
      });
      return `<g opacity="${layer.opacity ?? 1}">${content}</g>`;
    }).join("");
    const background = this.transparentCanvas ? "" : `<rect x="${viewMinX}" y="${viewMinY}" width="${viewWidth}" height="${viewHeight}" fill="${escapeXml(this.backgroundColor)}"/>`;
    if (eraserPaths.length) {
      definitions.push(`<mask id="goof-global-erase" mask-type="luminance" maskUnits="userSpaceOnUse" x="${viewMinX}" y="${viewMinY}" width="${viewWidth}" height="${viewHeight}"><rect x="${viewMinX}" y="${viewMinY}" width="${viewWidth}" height="${viewHeight}" fill="white"/>${eraserPaths.join("")}</mask>`);
    }
    const scene = eraserPaths.length
      ? `<g mask="url(#goof-global-erase)">${background}${layers}</g>`
      : `${background}${layers}`;
    const defs = definitions.length ? `<defs>${definitions.join("")}</defs>` : "";
    const outputWidth = this.infiniteCanvas ? Math.min(8192, Math.ceil(viewWidth)) : width;
    const outputHeight = this.infiniteCanvas ? Math.min(8192, Math.ceil(viewHeight)) : height;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="${viewMinX} ${viewMinY} ${viewWidth} ${viewHeight}">${defs}${scene}</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    if (download) downloadBlob(blob, "goof-doodle.svg");
    return blob;
  }

  async saveScene() {
    const imageIds = [...new Set(this.layers.flatMap((layer) =>
      layer.items.filter((item) => item.type === "image").map((item) => item.assetId)))];
    const assets = [];
    for (const id of imageIds) {
      const asset = this.imageAssets.get(id);
      if (!asset) {
        throw new Error(`The scene image "${id}" is missing from the prop library.`);
      }
      assets.push({
        id,
        name: asset.name,
        dataUrl: typeof asset.dataUrl === "string" ? asset.dataUrl : await blobToDataUrl(asset.blob),
      });
    }
    const file = {
      format: "goof-scene",
      version: 1,
      savedAt: new Date().toISOString(),
      state: this.getState(),
      assets,
    };
    downloadBlob(new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }), "goof-scene.goof");
  }

  resize() {
    const bounds = this.canvas.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;
    const pixelRatio = window.devicePixelRatio || 1;

    if (!width || !height) {
      return;
    }

    const backingWidth = Math.round(width * pixelRatio);
    const backingHeight = Math.round(height * pixelRatio);
    if (
      width === this.width &&
      height === this.height &&
      backingWidth === this.canvas.width &&
      backingHeight === this.canvas.height
    ) {
      return;
    }

    this.width = width;
    this.height = height;
    this.canvas.width = backingWidth;
    this.canvas.height = backingHeight;
    this.layerCanvas.width = backingWidth;
    this.layerCanvas.height = backingHeight;
    this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    this.render();
  }

  startPointer(event) {
    if (event.pointerType === "touch") {
      if (this.brush.tool === "select" && this.lastTouchTap &&
          performance.now() - this.lastTouchTap.time < 400 &&
          Math.hypot(event.clientX - this.lastTouchTap.x, event.clientY - this.lastTouchTap.y) < 24) {
        const point = this.normalizedPoint(event);
        let hit = this.hitTest(point);
        this.lastTouchTap = null;
        if (!hit && this.selectedItemId) {
          const selected = this.findItem(this.selectedItemId);
          if (selected) {
            const bounds = this.itemBounds(selected.item);
            const paddingX = 24 / (this.width * this.zoom);
            const paddingY = 24 / (this.height * this.zoom);
            if (point.x >= bounds.x - paddingX && point.x <= bounds.x + bounds.width + paddingX &&
                point.y >= bounds.y - paddingY && point.y <= bounds.y + bounds.height + paddingY) {
              hit = selected;
            }
          }
        }
        if (hit) {
          this.openContextMenu(event, hit);
          event.preventDefault();
          return;
        }
      }
      this.touchTapCandidate = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
      this.touchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (this.touchPointers.size >= 2) {
        const points = [...this.touchPointers.values()];
        const center = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
        const distance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
        this.activePointerId = null;
        this.interaction = {
          type: "touch-pan",
          pointerIds: [...this.touchPointers.keys()].slice(0, 2),
          center,
          distance,
          pan: { ...this.pan },
          zoom: this.zoom,
        };
        this.canvas.setPointerCapture(event.pointerId);
        event.preventDefault();
        return;
      }
    }
    if ((!event.isPrimary && event.pointerType !== "touch") || this.activePointerId !== null ||
        (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    event.preventDefault();
    if (this.spacePan) {
      this.activePointerId = event.pointerId;
      this.interaction = { type: "pan", start: { x: event.clientX, y: event.clientY }, pan: { ...this.pan } };
      this.canvas.setPointerCapture(event.pointerId);
      return;
    }
    const point = this.normalizedPoint(event);
    if (this.brush.tool === "fill") {
      const hit = this.fillMode === "canvas" ? null : this.hitTest(point);
      if (hit?.item.type === "shape" && !["line", "curve", "arc", "spiral"].includes(hit.item.shape)) {
        if (hit.item.fillColor !== this.brush.color || !hit.item.fill) {
          this.recordHistory();
          hit.item.fill = true;
          hit.item.fillColor = this.brush.color;
          this.render();
          this.notifyChange();
        }
        this.onFill({ target: "shape", color: this.brush.color });
      } else if (this.fillMode === "shape" || hit?.item.type === "shape") {
        this.onFill({ target: "miss" });
      } else {
        this.setBackgroundColor(this.brush.color);
        this.onFill({ target: "canvas", color: this.brush.color });
      }
      return;
    }
    if (this.brush.tool === "shapes") {
      const layer = this.activeLayer();
      if (!layer || layer.locked || !layer.visible) return;
      this.recordHistory();
      this.activePointerId = event.pointerId;
      this.interaction = { type: "shape", start: point, current: point, points: [point] };
      this.canvas.setPointerCapture(event.pointerId);
      this.render();
      return;
    }
    if (this.brush.tool === "select") {
      const hit = this.hitTest(point, { includeLocked: true });
      if (hit) {
        if (!hit.layer.locked) {
          this.activeLayerId = hit.layer.id;
        }
        if (event.shiftKey || event.ctrlKey || event.metaKey) {
          const ids = this.selectedItemIds.includes(hit.item.id)
            ? this.selectedItemIds.filter((id) => id !== hit.item.id)
            : [...this.selectedItemIds, hit.item.id];
          this.setSelectedItems(ids);
        } else if (!this.selectedItemIds.includes(hit.item.id)) {
          this.setSelectedItems([hit.item.id]);
        }
        this.notifyChange();
        if (!hit.layer.locked) {
          this.recordHistory();
          const selectedItems = this.getSelectedItems().filter((item) => !item.locked);
          this.activePointerId = event.pointerId;
          this.interaction = hit.groupHandle === "rotate"
            ? {
                type: "group-rotate",
                center: { x: hit.bounds.x + hit.bounds.width / 2, y: hit.bounds.y + hit.bounds.height / 2 },
                startAngle: this.angleFromCenter(point, {
                  x: hit.bounds.x + hit.bounds.width / 2,
                  y: hit.bounds.y + hit.bounds.height / 2,
                }),
                bounds: hit.bounds,
                items: selectedItems.map((selectedItem) => {
                  const found = this.findItem(selectedItem.id);
                  return { item: found.item, original: structuredClone(found.item), bounds: this.itemBounds(found.item) };
                }),
              }
            : hit.groupHandle === "resize"
              ? {
                  type: "group-resize",
                  start: point,
                  bounds: hit.bounds,
                  handle: hit.handle,
                  items: selectedItems.map((selectedItem) => {
                    const found = this.findItem(selectedItem.id);
                    return { item: found.item, original: structuredClone(found.item), bounds: this.itemBounds(found.item) };
                  }),
                }
            : hit.curveHandle !== undefined
            ? { type: "curve-handle", item: hit.item, handle: hit.curveHandle }
            : hit.rotateHandle
            ? { type: "rotate", item: hit.item, start: point, rotation: hit.item.rotation ?? 0, center: hit.center }
            : hit.handle
            ? { type: "resize", item: hit.item, handle: hit.handle, start: this.pointForItem(point, hit.item), bounds: this.itemBounds(hit.item), original: structuredClone(hit.item), center: { x: this.itemBounds(hit.item).x + this.itemBounds(hit.item).width / 2, y: this.itemBounds(hit.item).y + this.itemBounds(hit.item).height / 2 } }
            : selectedItems.length > 1 ? {
                type: "group-drag",
                start: point,
                items: selectedItems.map((item) => {
                  const found = this.findItem(item.id);
                  return {
                    item: found.item,
                    type: found.item.type,
                    x: found.item.x,
                    y: found.item.y,
                    bounds: this.itemBounds(found.item),
                    points: Array.isArray(found.item.points) ? found.item.points.map((entry) => ({ ...entry })) : null,
                    curvePoints: Array.isArray(found.item.curvePoints) ? found.item.curvePoints.map((entry) => ({ ...entry })) : null,
                  };
                }),
              } : {
                  type: "drag",
                  item: hit.item,
                  start: point,
                  x: hit.item.x,
                  y: hit.item.y,
                  points: Array.isArray(hit.item.points) ? hit.item.points.map((entry) => ({ ...entry })) : null,
                  curvePoints: Array.isArray(hit.item.curvePoints) ? hit.item.curvePoints.map((entry) => ({ ...entry })) : null,
                  bounds: ["stroke", "shape"].includes(hit.item.type) ? this.itemBounds(hit.item) : null,
                };
          this.canvas.setPointerCapture(event.pointerId);
        }
      } else {
        const additive = event.shiftKey || event.ctrlKey || event.metaKey;
        if (!additive) {
          this.setSelectedItems([]);
        }
        this.activePointerId = event.pointerId;
        this.interaction = {
          type: "marquee",
          start: point,
          current: point,
          additive,
          existingIds: additive ? [...this.selectedItemIds] : [],
        };
        this.canvas.setPointerCapture(event.pointerId);
        this.render();
      }
      return;
    }

    if (this.brush.tool === "eraser") {
      const hit = this.hitTest(point);
      if (hit && hit.item.type !== "stroke") {
        if (!hit.layer.locked) {
          this.setSelectedItem(hit.item.id);
          this.deleteSelectedItem();
        }
        return;
      }
    }

    const layer = this.activeLayer();
    if (!layer || layer.locked || !layer.visible) {
      return;
    }

    this.setSelectedItem(null);
    this.recordHistory();
    this.onPointerDown(event);
    const pressure = event.pointerType === "mouse" ? 1 : event.pressure;
    const effectiveWidth = this.widthCalculator(this.brush.size, pressure);
    if (!Number.isFinite(effectiveWidth) || effectiveWidth <= 0) {
      throw new Error("The brush width calculator returned an invalid width.");
    }

    const stroke = {
      id: createId("stroke"),
      type: "stroke",
      ...this.brush,
      size: effectiveWidth,
      points: [point],
    };
    layer.items.push(stroke);
    this.activePointerId = event.pointerId;
    this.interaction = { type: "stroke", stroke };
    this.canvas.setPointerCapture(event.pointerId);
    this.render();
    this.notifyChange();
  }

  movePointer(event) {
    if (event.pointerType === "touch" && this.touchPointers.has(event.pointerId)) {
      this.touchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
    if (this.interaction?.type === "touch-pan") {
      const points = this.interaction.pointerIds.map((id) => this.touchPointers.get(id)).filter(Boolean);
      if (points.length === 2) {
        const center = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
        const distance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
        const bounds = this.canvas.getBoundingClientRect();
        this.pan = {
          x: this.interaction.pan.x + center.x - this.interaction.center.x,
          y: this.interaction.pan.y + center.y - this.interaction.center.y,
        };
        if (this.interaction.distance > 0) {
          this.zoom = Math.max(0.25, Math.min(10, this.interaction.zoom * distance / this.interaction.distance));
          this.onZoomChange(this.zoom);
        }
        this.render();
      }
      event.preventDefault();
      return;
    }
    if (event.pointerId === this.activePointerId && this.interaction) {
      event.preventDefault();
      if (this.interaction.type === "stroke") {
        this.continueStroke(event, this.interaction.stroke);
      } else if (this.interaction.type === "marquee" || this.interaction.type === "shape") {
        this.interaction.current = this.normalizedPoint(event);
        if (this.interaction.type === "shape" && this.shapeKind === "freeform") {
          this.interaction.points.push(this.interaction.current);
        }
        this.render();
      } else if (this.interaction.type === "pan") {
        this.pan = {
          x: this.interaction.pan.x + event.clientX - this.interaction.start.x,
          y: this.interaction.pan.y + event.clientY - this.interaction.start.y,
        };
        this.render();
      } else if (this.interaction.type === "rotate") {
        const point = this.normalizedPoint(event);
        const startAngle = Math.atan2(this.interaction.start.y - this.interaction.center.y, this.interaction.start.x - this.interaction.center.x);
        const angle = Math.atan2(point.y - this.interaction.center.y, point.x - this.interaction.center.x);
        this.interaction.item.rotation = this.interaction.rotation + (angle - startAngle) * 180 / Math.PI;
        this.render();
        this.notifyChange();
      } else if (this.interaction.type === "group-resize" || this.interaction.type === "group-rotate") {
        this.transformSelectedGroup(this.normalizedPoint(event));
      } else {
        this.moveSelectedItem(this.normalizedPoint(event));
      }
      return;
    }

    const canSelect = this.brush.tool === "select";
    const hit = canSelect
      ? this.hitTest(this.normalizedPoint(event), { includeLocked: true })
      : null;
    const hoveredId = hit?.item.id ?? null;
    if (hoveredId !== this.hoveredItemId) {
      this.hoveredItemId = hoveredId;
      this.render();
    }
    const overRotateHandle = Boolean(hit?.rotateHandle) || hit?.groupHandle === "rotate";
    const overResizeHandle = Boolean(hit?.handle) || hit?.curveHandle !== undefined || hit?.groupHandle === "resize";
    this.canvas.classList.toggle("object-hovered", hoveredId !== null && !overResizeHandle && !overRotateHandle);
    this.canvas.classList.toggle("resize-hovered", this.brush.tool === "select" && overResizeHandle);
    this.canvas.classList.toggle("rotate-hovered", this.brush.tool === "select" && overRotateHandle);
    this.canvas.classList.toggle("move-active", this.brush.tool === "select");
    this.canvas.classList.toggle("select-active", this.brush.tool === "select");
  }

  endPointer(event) {
    if (event.pointerType === "touch") {
      const candidate = this.touchTapCandidate;
      if (event.type === "pointerup") {
        this.lastTouchTap = candidate?.id === event.pointerId &&
          performance.now() - candidate.time < 500 &&
          Math.hypot(event.clientX - candidate.x, event.clientY - candidate.y) < 16
          ? { x: candidate.x, y: candidate.y, time: performance.now() }
          : null;
        if (candidate?.id === event.pointerId) this.touchTapCandidate = null;
      } else if (event.type === "pointercancel") {
        this.lastTouchTap = null;
        if (candidate?.id === event.pointerId) this.touchTapCandidate = null;
      }
      this.touchPointers.delete(event.pointerId);
      if (this.interaction?.type === "touch-pan") {
        this.interaction = null;
        this.activePointerId = null;
        this.render();
        return;
      }
    }
    if (event.pointerId !== this.activePointerId) {
      return;
    }

    const endedStroke = this.interaction?.type === "stroke";
    const endedResize = ["resize", "group-resize"].includes(this.interaction?.type);
    const endedMarquee = this.interaction?.type === "marquee";
    const endedShape = this.interaction?.type === "shape";
    const marquee = endedMarquee ? this.interaction : null;
    const shape = endedShape ? this.interaction : null;
    this.activePointerId = null;
    this.interaction = null;
    this.guides = { x: null, y: null };
    if (marquee) {
      const dx = Math.abs(marquee.current.x - marquee.start.x);
      const dy = Math.abs(marquee.current.y - marquee.start.y);
      const selected = dx < 0.004 && dy < 0.004
        ? marquee.existingIds
        : [...new Set([
            ...marquee.existingIds,
            ...this.itemsInMarquee(marquee.start, marquee.current).map(({ item }) => item.id),
          ])];
      this.setSelectedItems(selected);
    }
    let createdShape = null;
    if (shape) {
      const x = Math.min(shape.start.x, shape.current.x);
      const y = Math.min(shape.start.y, shape.current.y);
      const width = Math.abs(shape.current.x - shape.start.x);
      const height = Math.abs(shape.current.y - shape.start.y);
      const hasShapeArea = width > 0.003 && height > 0.003;
      const isValidLine = this.shapeKind === "line" && (width > 0.003 || height > 0.003);
      if (hasShapeArea || isValidLine) {
        const layer = this.activeLayer();
        const constrainedSize = Math.min(width * this.width, height * this.height);
        const constrainedWidth = constrainedSize / this.width;
        const constrainedHeight = constrainedSize / this.height;
        const item = {
          id: createId("shape"),
          type: "shape",
          shape: this.shapeKind,
          x,
          y,
          width: ["circle", "square"].includes(this.shapeKind) ? constrainedWidth : width,
          height: ["circle", "square"].includes(this.shapeKind) ? constrainedHeight : height,
          color: this.brush.color,
          fillColor: this.brush.color,
          fill: this.shapeFill,
          stroke: this.shapeStroke,
          strokeWidth: this.brush.size,
        };
        if (this.shapeKind === "polygon") item.sides = this.shapeSides;
        if (this.shapeKind === "curve") {
          item.curvePoints = [
            { x, y: y + height },
            { x: x + width * 0.25, y: y + height * 0.05 },
            { x: x + width * 0.75, y: y + height * 0.95 },
            { x: x + width, y },
          ];
        }
        if (this.shapeKind === "freeform") {
          item.points = shape.points;
          const xs = item.points.map((point) => point.x);
          const ys = item.points.map((point) => point.y);
          item.x = Math.min(...xs);
          item.y = Math.min(...ys);
          item.width = Math.max(0.001, Math.max(...xs) - item.x);
          item.height = Math.max(0.001, Math.max(...ys) - item.y);
        }
        layer.items.push(item);
        this.setSelectedItem(item.id);
        createdShape = item;
      }
    }
    this.render();
    if (endedStroke) {
      this.onStrokeEnd();
    }
    this.notifyChange();
    if (endedResize) {
      this.notifySelection();
    }
    if (endedMarquee || endedShape) {
      this.notifySelection();
    }
    if (createdShape) this.onShapeCreated(createdShape);
  }

  itemsInMarquee(start, end) {
    const rect = {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    };
    return this.layers.filter((layer) => layer.visible).flatMap((layer) =>
      layer.items.filter((item) => {
        if (!this.itemMatchesType(item)) return false;
        const bounds = this.itemBounds(item);
        return bounds.x <= rect.x + rect.width &&
          bounds.x + bounds.width >= rect.x &&
          bounds.y <= rect.y + rect.height &&
          bounds.y + bounds.height >= rect.y;
      }).map((item) => ({ layer, item })));
  }

  continueStroke(event, stroke) {
    const events = event.getCoalescedEvents?.() ?? [event];
    for (const pointerEvent of events) {
      const point = this.normalizedPoint(pointerEvent);
      const previousPoint = stroke.points[stroke.points.length - 1];
      if (point.x === previousPoint.x && point.y === previousPoint.y) {
        continue;
      }
      stroke.points.push(point);
    }
    this.render();
  }

  angleFromCenter(point, center) {
    return Math.atan2((point.y - center.y) * this.height, (point.x - center.x) * this.width);
  }

  transformSelectedGroup(point) {
    const drag = this.interaction;
    if (!drag || !["group-resize", "group-rotate"].includes(drag.type)) return;
    if (drag.type === "group-rotate") {
      const angle = this.angleFromCenter(point, drag.center) - drag.startAngle;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      for (const entry of drag.items) {
        const origin = entry.original;
        const centerX = (entry.bounds.x + entry.bounds.width / 2) * this.width;
        const centerY = (entry.bounds.y + entry.bounds.height / 2) * this.height;
        const groupX = drag.center.x * this.width;
        const groupY = drag.center.y * this.height;
        const nextCenterX = groupX + (centerX - groupX) * cosine - (centerY - groupY) * sine;
        const nextCenterY = groupY + (centerX - groupX) * sine + (centerY - groupY) * cosine;
        const deltaX = (nextCenterX - centerX) / this.width;
        const deltaY = (nextCenterY - centerY) / this.height;
        Object.assign(entry.item, origin);
        if (origin.type === "stroke") {
          entry.item.points = origin.points.map((p) => ({ x: p.x + deltaX, y: p.y + deltaY }));
        } else {
          entry.item.x = origin.x + deltaX;
          entry.item.y = origin.y + deltaY;
          if (Array.isArray(origin.points)) {
            entry.item.points = origin.points.map((p) => ({ x: p.x + deltaX, y: p.y + deltaY }));
          }
          if (Array.isArray(origin.curvePoints)) {
            entry.item.curvePoints = origin.curvePoints.map((p) => ({ x: p.x + deltaX, y: p.y + deltaY }));
          }
        }
        entry.item.rotation = (origin.rotation ?? 0) + angle * 180 / Math.PI;
      }
    } else {
      const bounds = drag.bounds;
      let left = bounds.x;
      let right = bounds.x + bounds.width;
      let top = bounds.y;
      let bottom = bounds.y + bounds.height;
      const minimum = this.infiniteCanvas ? -Infinity : 0;
      const maximum = this.infiniteCanvas ? Infinity : 1;
      if (drag.handle.includes("w")) left = Math.max(minimum, Math.min(right - 0.005, point.x));
      if (drag.handle.includes("e")) right = Math.min(maximum, Math.max(left + 0.005, point.x));
      if (drag.handle.includes("n")) top = Math.max(minimum, Math.min(bottom - 0.005, point.y));
      if (drag.handle.includes("s")) bottom = Math.min(maximum, Math.max(top + 0.005, point.y));
      const next = { x: left, y: top, width: right - left, height: bottom - top };
      const scaleX = next.width / Math.max(bounds.width, 0.005);
      const scaleY = next.height / Math.max(bounds.height, 0.005);
      const mapPoint = (entry) => ({
        x: next.x + (entry.x - bounds.x) * scaleX,
        y: next.y + (entry.y - bounds.y) * scaleY,
      });
      for (const entry of drag.items) {
        const original = entry.original;
        const originalBounds = entry.bounds;
        const nextItemBounds = {
          x: next.x + (originalBounds.x - bounds.x) * scaleX,
          y: next.y + (originalBounds.y - bounds.y) * scaleY,
          width: originalBounds.width * scaleX,
          height: originalBounds.height * scaleY,
        };
        Object.assign(entry.item, original);
        if (original.type === "stroke") {
          entry.item.points = original.points.map(mapPoint);
          entry.item.size = Math.max(1, original.size * Math.sqrt(scaleX * scaleY));
        } else if (original.type === "text") {
          entry.item.x = nextItemBounds.x;
          entry.item.y = nextItemBounds.y;
          entry.item.fontSize = Math.round(Math.max(8, Math.min(240,
            original.fontSize * Math.sqrt(scaleX * scaleY))));
        } else if (original.type === "image") {
          entry.item.x = nextItemBounds.x;
          entry.item.y = nextItemBounds.y;
          entry.item.width = nextItemBounds.width;
          entry.item.aspectRatio = (nextItemBounds.width * this.width) /
            Math.max(1, nextItemBounds.height * this.height);
        } else {
          entry.item.x = nextItemBounds.x;
          entry.item.y = nextItemBounds.y;
          entry.item.width = nextItemBounds.width;
          entry.item.height = nextItemBounds.height;
          entry.item.strokeWidth = Math.max(1, (original.strokeWidth ?? 3) * Math.sqrt(scaleX * scaleY));
          if (Array.isArray(original.points)) entry.item.points = original.points.map(mapPoint);
          if (Array.isArray(original.curvePoints)) entry.item.curvePoints = original.curvePoints.map(mapPoint);
        }
      }
    }
    this.render();
    this.notifyChange();
  }

  moveSelectedItem(point) {
    const drag = this.interaction;
    if (!drag || !["drag", "resize", "group-drag", "curve-handle"].includes(drag.type)) {
      return;
    }

    if (drag.type === "curve-handle") {
      const localPoint = this.pointForItem(point, drag.item);
      const minimum = this.infiniteCanvas ? -Infinity : 0;
      const maximum = this.infiniteCanvas ? Infinity : 1;
      drag.item.curvePoints[drag.handle] = {
        x: Math.max(minimum, Math.min(maximum, localPoint.x)),
        y: Math.max(minimum, Math.min(maximum, localPoint.y)),
      };
      this.render();
      this.notifyChange();
      return;
    }

    if (drag.type === "group-drag") {
      const bounds = drag.items.reduce((combined, entry) => ({
        x: Math.min(combined.x, entry.bounds.x),
        y: Math.min(combined.y, entry.bounds.y),
        right: Math.max(combined.right, entry.bounds.x + entry.bounds.width),
        bottom: Math.max(combined.bottom, entry.bounds.y + entry.bounds.height),
      }), { x: Infinity, y: Infinity, right: -Infinity, bottom: -Infinity });
      const deltaX = point.x - drag.start.x;
      const deltaY = point.y - drag.start.y;
      const delta = {
        x: this.infiniteCanvas ? deltaX : Math.max(-bounds.x, Math.min(1 - bounds.right, deltaX)),
        y: this.infiniteCanvas ? deltaY : Math.max(-bounds.y, Math.min(1 - bounds.bottom, deltaY)),
      };
      for (const entry of drag.items) {
        if (entry.type === "stroke") {
          entry.item.points = entry.points.map((origin) => ({ x: origin.x + delta.x, y: origin.y + delta.y }));
        } else if (entry.type === "shape") {
          entry.item.x = entry.x + delta.x;
          entry.item.y = entry.y + delta.y;
          if (entry.item.shape === "freeform") {
            entry.item.points = entry.points.map((origin) => ({ x: origin.x + delta.x, y: origin.y + delta.y }));
          }
          if (entry.curvePoints) {
            entry.item.curvePoints = entry.curvePoints.map((origin) => ({ x: origin.x + delta.x, y: origin.y + delta.y }));
          }
        } else {
          entry.item.x = entry.x + delta.x;
          entry.item.y = entry.y + delta.y;
        }
      }
      this.guides = { x: null, y: null };
      this.render();
      this.notifyChange();
      return;
    }

    if (drag.type === "resize") {
      this.resizeSelectedItem(this.pointForItem(point, drag.item, drag.center));
      return;
    }
    if (drag.type === "rotate") return;

    if (["stroke", "shape"].includes(drag.item.type)) {
      const deltaX = point.x - drag.start.x;
      const deltaY = point.y - drag.start.y;
      const delta = {
        x: this.infiniteCanvas ? deltaX : Math.max(-drag.bounds.x, Math.min(1 - drag.bounds.x - drag.bounds.width, deltaX)),
        y: this.infiniteCanvas ? deltaY : Math.max(-drag.bounds.y, Math.min(1 - drag.bounds.y - drag.bounds.height, deltaY)),
      };
      if (drag.item.type === "stroke") {
        drag.item.points = drag.points.map((entry) => ({ x: entry.x + delta.x, y: entry.y + delta.y }));
      } else {
        drag.item.x = drag.bounds.x + delta.x;
        drag.item.y = drag.bounds.y + delta.y;
        if (drag.item.shape === "freeform") {
          drag.item.points = drag.points.map((origin) => ({ x: origin.x + delta.x, y: origin.y + delta.y }));
        }
        if (drag.curvePoints) {
          drag.item.curvePoints = drag.curvePoints.map((origin) => ({ x: origin.x + delta.x, y: origin.y + delta.y }));
        }
      }
      this.guides = { x: null, y: null };
      this.render();
      this.notifyChange();
      return;
    }

    const dimensions = this.itemSize(drag.item);
    const proposed = {
      x: this.infiniteCanvas ? drag.x + point.x - drag.start.x
        : Math.max(0, Math.min(1 - dimensions.width, drag.x + point.x - drag.start.x)),
      y: this.infiniteCanvas ? drag.y + point.y - drag.start.y
        : Math.max(0, Math.min(1 - dimensions.height, drag.y + point.y - drag.start.y)),
    };
    const snap = this.findSnap(drag.item, proposed, dimensions);
    drag.item.x = this.infiniteCanvas ? proposed.x + snap.x.offset
      : Math.max(0, Math.min(1 - dimensions.width, proposed.x + snap.x.offset));
    drag.item.y = this.infiniteCanvas ? proposed.y + snap.y.offset
      : Math.max(0, Math.min(1 - dimensions.height, proposed.y + snap.y.offset));
    this.guides = { x: snap.x.guide, y: snap.y.guide };
    this.render();
    this.notifyChange();
  }

  resizeSelectedItem(point) {
    const drag = this.interaction;
    if (!drag || drag.type !== "resize") {
      return;
    }

    const original = drag.original;
    const bounds = drag.bounds;
    const dx = point.x - drag.start.x;
    const dy = point.y - drag.start.y;
    let left = bounds.x;
    let right = bounds.x + bounds.width;
    let top = bounds.y;
    let bottom = bounds.y + bounds.height;
    const minimum = this.infiniteCanvas ? -Infinity : 0;
    const maximum = this.infiniteCanvas ? Infinity : 1;
    if (drag.handle.includes("w")) left = Math.min(right - 0.005, Math.max(minimum, bounds.x + dx));
    if (drag.handle.includes("e")) right = Math.max(left + 0.005, Math.min(maximum, bounds.x + bounds.width + dx));
    if (drag.handle.includes("n")) top = Math.min(bottom - 0.005, Math.max(minimum, bounds.y + dy));
    if (drag.handle.includes("s")) bottom = Math.max(top + 0.005, Math.min(maximum, bounds.y + bounds.height + dy));
    const next = { x: left, y: top, width: right - left, height: bottom - top };
    const scaleX = next.width / Math.max(bounds.width, 0.005);
    const scaleY = next.height / Math.max(bounds.height, 0.005);
    const mapPoint = (entry) => ({
      x: next.x + (entry.x - bounds.x) * scaleX,
      y: next.y + (entry.y - bounds.y) * scaleY,
    });
    if (original.type === "text") {
      const scale = Math.sqrt(scaleX * scaleY);
      drag.item.fontSize = Math.round(Math.max(8, Math.min(240, original.fontSize * scale)));
      const measured = this.itemBounds(drag.item);
      drag.item.x = next.x;
      drag.item.y = next.y;
      if (drag.handle.includes("w")) drag.item.x = right - measured.width;
      if (drag.handle.includes("n")) drag.item.y = bottom - measured.height;
    } else if (original.type === "image") {
      drag.item.x = next.x;
      drag.item.y = next.y;
      drag.item.width = next.width;
      drag.item.aspectRatio = (next.width * this.width) / (next.height * this.height);
      if (drag.handle.includes("w")) drag.item.x = right - next.width;
      if (drag.handle.includes("n")) drag.item.y = bottom - next.height;
    } else if (original.type === "stroke") {
      drag.item.points = original.points.map(mapPoint);
      drag.item.size = Math.max(1, original.size * Math.sqrt(scaleX * scaleY));
    } else {
      drag.item.x = next.x;
      drag.item.y = next.y;
      drag.item.width = next.width;
      drag.item.height = next.height;
      if (Array.isArray(original.points)) drag.item.points = original.points.map(mapPoint);
      if (Array.isArray(original.curvePoints)) drag.item.curvePoints = original.curvePoints.map(mapPoint);
    }
    this.render();
    this.notifyChange();
  }

  findSnap(item, position, dimensions) {
    const xAnchors = [0, dimensions.width / 2, dimensions.width];
    const yAnchors = [0, dimensions.height / 2, dimensions.height];
    let xSnap = { offset: 0, guide: null, distance: SNAP_DISTANCE };
    let ySnap = { offset: 0, guide: null, distance: SNAP_DISTANCE };
    const targets = [
      { x: 0, y: 0, width: 1, height: 1 },
      { x: 0.5, y: 0.5, width: 0, height: 0 },
      ...this.layers.filter((layer) => layer.visible).flatMap((layer) =>
        layer.items.filter((other) => other.id !== item.id && other.type !== "stroke")
          .map((other) => ({ x: other.x, y: other.y, ...this.itemSize(other) }))),
    ];

    for (const target of targets) {
      const targetX = [target.x, target.x + target.width / 2, target.x + target.width];
      const targetY = [target.y, target.y + target.height / 2, target.y + target.height];
      for (const movingAnchor of xAnchors) {
        for (const targetAnchor of targetX) {
          const offset = targetAnchor - (position.x + movingAnchor);
          const distance = Math.abs(offset * this.width);
          if (distance < xSnap.distance) {
            xSnap = { offset, guide: targetAnchor, distance };
          }
        }
      }
      for (const movingAnchor of yAnchors) {
        for (const targetAnchor of targetY) {
          const offset = targetAnchor - (position.y + movingAnchor);
          const distance = Math.abs(offset * this.height);
          if (distance < ySnap.distance) {
            ySnap = { offset, guide: targetAnchor, distance };
          }
        }
      }
    }
    return { x: xSnap, y: ySnap };
  }

  editTextAtPointer(event) {
    const hit = this.hitTest(this.normalizedPoint(event));
    if (hit?.item.type === "text") {
      this.activeLayerId = hit.layer.id;
      this.setSelectedItem(hit.item.id);
      this.onEditText({ ...hit.item });
    } else if (hit?.item.type === "shape") {
      this.activeLayerId = hit.layer.id;
      this.setSelectedItem(hit.item.id);
      this.onEditShape({ ...hit.item });
    }
  }

  hitTest(point, { includeLocked = false } = {}) {
    const groupEntries = this.transformableSelection();
    if (groupEntries.length > 1) {
      const bounds = this.selectionBounds(groupEntries);
      const rotationHandle = this.groupRotationHandlePoint(bounds);
      if (Math.hypot((point.x - rotationHandle.x) * this.width,
          (point.y - rotationHandle.y) * this.height) <= 9 / this.zoom) {
        return { ...groupEntries[0], groupHandle: "rotate", bounds };
      }
      const handle = this.resizeHandleInBounds(point, bounds);
      if (handle) return { ...groupEntries[0], groupHandle: "resize", handle, bounds };
    }
    const selected = this.findItem(this.selectedItemId);
    if (this.selectedItemIds.length === 1 && selected && this.itemMatchesType(selected.item) &&
        !selected.layer.locked && selected.layer.visible) {
      const localPoint = this.pointForItem(point, selected.item);
      const rotateHandle = this.rotationHandleAt(point, selected.item);
      if (rotateHandle) {
        const bounds = this.itemBounds(selected.item);
        return {
          layer: selected.layer,
          item: selected.item,
          rotateHandle: true,
          center: { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 },
        };
      }
      const handle = this.resizeHandleAt(localPoint, selected.item, true);
      if (handle) return { layer: selected.layer, item: selected.item, handle };
    }
    if (selected && this.itemMatchesType(selected.item) &&
        !selected.layer.locked && selected.layer.visible &&
        selected.item.type === "shape" && selected.item.shape === "curve") {
      const localPoint = this.pointForItem(point, selected.item);
      const curvePoints = selected.item.curvePoints ?? [];
      for (const index of [1, 2]) {
        const handle = curvePoints[index];
        if (handle && Math.hypot((handle.x - localPoint.x) * this.width, (handle.y - localPoint.y) * this.height) <= 10 / this.zoom) {
          return { layer: selected.layer, item: selected.item, curveHandle: index };
        }
      }
    }
    for (let layerIndex = this.layers.length - 1; layerIndex >= 0; layerIndex -= 1) {
      const layer = this.layers[layerIndex];
      if (!layer.visible || (layer.locked && !includeLocked)) {
        continue;
      }
      for (let itemIndex = layer.items.length - 1; itemIndex >= 0; itemIndex -= 1) {
        const item = layer.items[itemIndex];
        if (!this.itemMatchesType(item)) continue;
        if (item.type === "stroke") {
          if (this.hitStroke(point, item)) {
            return { layer, item };
          }
          continue;
        }
        const bounds = this.itemBounds(item);
        const localPoint = this.pointForItem(point, item);
        const padding = item.type === "shape"
          ? Math.max(5, (item.strokeWidth ?? 3) / 2) / Math.min(this.width, this.height)
          : 0;
        if (
          localPoint.x >= bounds.x - padding &&
          localPoint.x <= bounds.x + bounds.width + padding &&
          localPoint.y >= bounds.y - padding &&
          localPoint.y <= bounds.y + bounds.height + padding
        ) {
          return { layer, item };
        }
      }
    }
    return null;
  }

  groupRotationHandlePoint(bounds) {
    return {
      x: bounds.x + bounds.width / 2,
      y: bounds.y - 24 / (this.height * this.zoom),
    };
  }

  hitStroke(point, stroke) {
    const points = stroke.points;
    if (!points.length) {
      return false;
    }
    const threshold = Math.max(7, stroke.size / 2 + 4);
    const x = point.x * this.width;
    const y = point.y * this.height;
    if (points.length === 1) {
      return Math.hypot((points[0].x - point.x) * this.width, (points[0].y - point.y) * this.height)
        <= threshold + stroke.size / 2;
    }
    for (let index = 1; index < points.length; index += 1) {
      const start = { x: points[index - 1].x * this.width, y: points[index - 1].y * this.height };
      const end = { x: points[index].x * this.width, y: points[index].y * this.height };
      if (this.distanceToSegment(x, y, start, end) <= threshold + stroke.size / 2) {
        return true;
      }
    }
    return false;
  }

  distanceToSegment(x, y, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;
    const projection = lengthSquared
      ? Math.max(0, Math.min(1, ((x - start.x) * dx + (y - start.y) * dy) / lengthSquared))
      : 0;
    return Math.hypot(x - (start.x + projection * dx), y - (start.y + projection * dy));
  }

  itemSize(item) {
    if (item.type === "stroke") {
      const bounds = this.strokeBounds(item);
      return { width: bounds.width, height: bounds.height };
    }
    if (item.type === "image") {
      const aspectRatio = item.aspectRatio ?? (item.width * this.width) / (item.height * this.height);
      return {
        width: item.width,
        height: (item.width * this.width / aspectRatio) / this.height,
      };
    }
    if (item.type === "shape") {
      return { width: item.width, height: item.height };
    }
    const bounds = this.textBounds(item);
    return { width: bounds.width / this.width, height: bounds.height / this.height };
  }

  itemBounds(item) {
    if (item.type === "stroke") {
      return this.strokeBounds(item);
    }
    const dimensions = this.itemSize(item);
    return { x: item.x, y: item.y, ...dimensions };
  }

  strokeBounds(stroke) {
    const points = stroke.points;
    if (!points.length) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    const paddingX = (stroke.size / 2 + 3) / this.width;
    const paddingY = (stroke.size / 2 + 3) / this.height;
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    for (const point of points) {
      left = Math.min(left, point.x);
      top = Math.min(top, point.y);
      right = Math.max(right, point.x);
      bottom = Math.max(bottom, point.y);
    }
    if (this.infiniteCanvas) {
      return {
        x: left - paddingX,
        y: top - paddingY,
        width: right - left + paddingX * 2,
        height: bottom - top + paddingY * 2,
      };
    }
    return {
      x: Math.max(0, left - paddingX),
      y: Math.max(0, top - paddingY),
      width: Math.min(1, right + paddingX) - Math.max(0, left - paddingX),
      height: Math.min(1, bottom + paddingY) - Math.max(0, top - paddingY),
    };
  }

  resizeHandleAt(point, item, isLocal = false) {
    const bounds = this.itemBounds(item);
    const localPoint = isLocal ? point : this.pointForItem(point, item);
    return this.resizeHandleInBounds(localPoint, bounds);
  }

  resizeHandleInBounds(point, bounds) {
    const x = point.x * this.width;
    const y = point.y * this.height;
    const tolerance = 18 / this.zoom;
    for (const handle of this.resizeHandles(bounds)) {
      if (Math.hypot(x - handle.x * this.width, y - handle.y * this.height) <= tolerance) {
        return handle.name;
      }
    }
    const left = bounds.x * this.width;
    const right = (bounds.x + bounds.width) * this.width;
    const top = bounds.y * this.height;
    const bottom = (bounds.y + bounds.height) * this.height;
    const edgeTolerance = 14 / this.zoom;
    if (x >= left - edgeTolerance && x <= right + edgeTolerance) {
      if (Math.abs(y - top) <= edgeTolerance) return "n";
      if (Math.abs(y - bottom) <= edgeTolerance) return "s";
    }
    if (y >= top - edgeTolerance && y <= bottom + edgeTolerance) {
      if (Math.abs(x - left) <= edgeTolerance) return "w";
      if (Math.abs(x - right) <= edgeTolerance) return "e";
    }
    return null;
  }

  rotationHandlePoint(item) {
    const bounds = this.itemBounds(item);
    const center = { x: bounds.x + bounds.width / 2, y: bounds.y - 24 / (this.height * this.zoom) };
    const angle = (item.rotation ?? 0) * Math.PI / 180;
    const origin = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const dx = center.x - origin.x;
    const dy = center.y - origin.y;
    return {
      x: origin.x + dx * Math.cos(angle) - dy * Math.sin(angle),
      y: origin.y + dx * Math.sin(angle) + dy * Math.cos(angle),
    };
  }

  rotationHandleAt(point, item) {
    const handle = this.rotationHandlePoint(item);
    return Math.hypot((point.x - handle.x) * this.width, (point.y - handle.y) * this.height) <= 9 / this.zoom;
  }

  resizeHandles(bounds) {
    const left = bounds.x;
    const right = bounds.x + bounds.width;
    const top = bounds.y;
    const bottom = bounds.y + bounds.height;
    return [
      { name: "nw", x: left, y: top },
      { name: "n", x: (left + right) / 2, y: top },
      { name: "ne", x: right, y: top },
      { name: "e", x: right, y: (top + bottom) / 2 },
      { name: "se", x: right, y: bottom },
      { name: "s", x: (left + right) / 2, y: bottom },
      { name: "sw", x: left, y: bottom },
      { name: "w", x: left, y: (top + bottom) / 2 },
    ];
  }

  textBounds(item) {
    const context = this.context;
    const fontSize = item.fontSize ?? 32;
    context.save();
    context.font = `700 ${fontSize}px "Trebuchet MS", "Segoe UI", sans-serif`;
    const lines = this.textLines(item.text, Math.max(40, this.width * 0.75));
    const width = Math.max(24, ...lines.map((line) => context.measureText(line).width));
    context.restore();
    return { width: width + 12, height: lines.length * fontSize * 1.3 + 8 };
  }

  textLines(text, maxWidth) {
    const context = this.context;
    const lines = [];
    for (const paragraph of text.split("\n")) {
      const words = paragraph.split(/\s+/);
      let line = "";
      for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && context.measureText(candidate).width > maxWidth) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      lines.push(line);
    }
    return lines;
  }

  normalizedPoint(event) {
    const bounds = this.canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.left - this.pan.x) / bounds.width;
    const y = (event.clientY - bounds.top - this.pan.y) / bounds.height;
    const point = { x: (x - 0.5) / this.zoom + 0.5, y: (y - 0.5) / this.zoom + 0.5 };
    return this.infiniteCanvas
      ? point
      : { x: Math.max(0, Math.min(1, point.x)), y: Math.max(0, Math.min(1, point.y)) };
  }

  activeLayer() {
    return this.layers.find((layer) => layer.id === this.activeLayerId);
  }

  findItem(id) {
    if (!id) {
      return null;
    }
    for (const layer of this.layers) {
      const item = layer.items.find((entry) => entry.id === id);
      if (item) {
        return { layer, item };
      }
    }
    return null;
  }

  setSelectedItem(id) {
    this.setSelectedItems(id ? [id] : []);
  }

  setSelectedItems(ids) {
    const nextIds = [...new Set(ids)].filter((id) => this.findItem(id));
    if (nextIds.length === this.selectedItemIds.length &&
        nextIds.every((id, index) => id === this.selectedItemIds[index])) return;
    this.selectedItemIds = nextIds;
    const id = nextIds.at(-1) ?? null;
    this.selectedItemId = id;
    this.render();
    this.notifySelection();
  }

  notifyChange() {
    this.onChange(this.getLayers());
  }

  notifyHistoryChange() {
    this.onHistoryChange({ canUndo: this.undoStack.length > 0, canRedo: this.redoStack.length > 0 });
  }

  notifySelection() {
    this.onSelectionChange(this.getSelectedItems());
  }

  drawStroke(stroke) {
    const context = this.context;
    const points = stroke.points;
    if (!points.length) return;
    context.save();
    context.globalCompositeOperation = stroke.tool === "eraser" ? "destination-out" : "source-over";
    context.strokeStyle = stroke.tool === "eraser" ? "#000" : stroke.color;
    context.fillStyle = stroke.tool === "eraser" ? "#000" : stroke.color;
    const opacity = Math.max(0, Math.min(1, stroke.opacity ?? 1));
    context.lineCap = stroke.shape === "square" ? "square" : "round";
    context.lineJoin = stroke.shape === "square" ? "bevel" : "round";
    const kind = stroke.kind ?? "ink";
    const first = points[0];
    if (points.length === 1) {
      const width = stroke.size * (kind === "airbrush" ? 2.4 : 1);
      context.globalAlpha = opacity * (kind === "airbrush" ? 0.24 : 1);
      if (stroke.shape === "square") {
        context.fillRect(first.x * this.width - width / 2, first.y * this.height - width / 2, width, width);
      } else {
        context.beginPath();
        context.arc(first.x * this.width, first.y * this.height, width / 2, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
      return;
    }
    const drawSmoothPath = () => {
      context.beginPath();
      context.moveTo(first.x * this.width, first.y * this.height);
      for (let index = 1; index < points.length - 1; index += 1) {
        const current = points[index];
        const next = points[index + 1];
        context.quadraticCurveTo(
          current.x * this.width,
          current.y * this.height,
          (current.x + next.x) * this.width / 2,
          (current.y + next.y) * this.height / 2,
        );
      }
      const last = points.at(-1);
      context.lineTo(last.x * this.width, last.y * this.height);
      context.stroke();
    };
    if (kind === "airbrush") {
      context.globalAlpha = opacity * 0.075;
      context.lineWidth = stroke.size * 3.2;
      drawSmoothPath();
      context.globalAlpha = opacity * 0.2;
      context.lineWidth = stroke.size * 1.15;
      drawSmoothPath();
    } else if (kind === "crayon") {
      context.globalAlpha = opacity * 0.68;
      context.lineWidth = stroke.size * 1.1;
      context.setLineDash([Math.max(1, stroke.size * 0.72), Math.max(1, stroke.size * 0.28)]);
      drawSmoothPath();
      context.globalAlpha = opacity * 0.48;
      context.lineWidth = stroke.size * 0.64;
      context.setLineDash([Math.max(1, stroke.size * 0.16), Math.max(1, stroke.size * 0.24)]);
      context.lineDashOffset = Math.max(1, stroke.size * 0.11);
      drawSmoothPath();
    } else {
      context.globalAlpha = opacity;
      context.lineWidth = stroke.size * (kind === "crayon" ? 1.12 : 1);
      drawSmoothPath();
    }
    context.restore();
  }

  drawText(item) {
    const context = this.context;
    const fontSize = item.fontSize ?? 32;
    context.save();
    context.font = `700 ${fontSize}px "Trebuchet MS", "Segoe UI", sans-serif`;
    context.fillStyle = item.color ?? "#34314a";
    context.textBaseline = "top";
    const lines = this.textLines(item.text, Math.max(40, this.width * 0.75));
    lines.forEach((line, index) => {
      context.fillText(line, item.x * this.width + 6, item.y * this.height + 4 + index * fontSize * 1.3);
    });
    context.restore();
  }

  loadImage(id) {
    if (this.imageCache.has(id)) {
      return this.imageCache.get(id);
    }
    const asset = this.imageAssets.get(id);
    if (!asset) {
      return Promise.reject(new Error("This scene image is missing from the prop library."));
    }

    const imagePromise = new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => {
        this.imageCache.set(id, image);
        this.render();
        resolve(image);
      }, { once: true });
      image.addEventListener("error", () => {
        this.imageCache.delete(id);
        reject(new Error(`Could not load library image "${asset.name}".`));
      }, { once: true });
      if (asset.blob instanceof Blob) {
        const url = URL.createObjectURL(asset.blob);
        this.imageUrls.set(id, url);
        image.src = url;
      } else if (typeof asset.dataUrl === "string") {
        image.src = asset.dataUrl;
      } else {
        reject(new Error(`Library image "${asset.name}" has no image data.`));
      }
    });
    this.imageCache.set(id, imagePromise);
    return imagePromise;
  }

  drawImageItem(item) {
    const cachedImage = this.imageCache.get(item.assetId);
    if (cachedImage instanceof Promise) {
      return;
    }
    if (cachedImage) {
      const dimensions = this.itemSize(item);
      this.context.drawImage(
        cachedImage,
        item.x * this.width,
        item.y * this.height,
        dimensions.width * this.width,
        dimensions.height * this.height,
      );
      return;
    }
    void this.loadImage(item.assetId).catch((error) => {
      console.error("Could not load a saved library image.", error);
    });
  }

  drawItem(item) {
    this.context.save();
    this.withItemRotation(this.context, item);
    if (item.type === "stroke") {
      const firstPoint = item.points[0];
      if (!firstPoint) {
        this.context.restore();
        return;
      }
      this.drawStroke(item);
    } else if (item.type === "text") {
      this.drawText(item);
    } else if (item.type === "image") {
      this.drawImageItem(item);
    } else if (item.type === "shape") {
      this.drawShape(item);
    }
    this.context.restore();
  }

  traceShape(item) {
    const context = this.context;
    const x = item.x * this.width;
    const y = item.y * this.height;
    const width = item.width * this.width;
    const height = item.height * this.height;
    const kind = item.shape;
    context.beginPath();
    if (["circle", "oval", "ellipse"].includes(kind)) {
      context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    } else if (kind === "line") {
      context.moveTo(x, y);
      context.lineTo(x + width, y + height);
    } else if (kind === "curve") {
      const points = item.curvePoints ?? [
        { x: item.x, y: item.y + item.height },
        { x: item.x + item.width * 0.25, y: item.y + item.height * 0.05 },
        { x: item.x + item.width * 0.75, y: item.y + item.height * 0.95 },
        { x: item.x + item.width, y: item.y },
      ];
      context.moveTo(points[0].x * this.width, points[0].y * this.height);
      context.bezierCurveTo(
        points[1].x * this.width, points[1].y * this.height,
        points[2].x * this.width, points[2].y * this.height,
        points[3].x * this.width, points[3].y * this.height,
      );
    } else if (kind === "arc") {
      context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, Math.PI, Math.PI * 2);
    } else if (kind === "rounded-rectangle") {
      context.roundRect(x, y, width, height, Math.min(width, height) * 0.18);
    } else if (kind === "triangle") {
      context.moveTo(x + width / 2, y);
      context.lineTo(x + width, y + height);
      context.lineTo(x, y + height);
      context.closePath();
    } else if (kind === "right-triangle") {
      context.moveTo(x, y);
      context.lineTo(x, y + height);
      context.lineTo(x + width, y + height);
      context.closePath();
    } else if (kind === "diamond") {
      context.moveTo(x + width / 2, y);
      context.lineTo(x + width, y + height / 2);
      context.lineTo(x + width / 2, y + height);
      context.lineTo(x, y + height / 2);
      context.closePath();
    } else if (["pentagon", "hexagon", "octagon", "star", "cross", "parallelogram", "trapezoid", "polygon"].includes(kind)) {
      const sides = kind === "polygon"
        ? Math.max(3, Math.min(12, Math.round(item.sides ?? this.shapeSides)))
        : { pentagon: 5, hexagon: 6, octagon: 8, star: 10, cross: 12, parallelogram: 4, trapezoid: 4 }[kind];
      for (let index = 0; index < sides; index += 1) {
        let px;
        let py;
        if (kind === "parallelogram") {
          const points = [[x + width * .25, y], [x + width, y], [x + width * .75, y + height], [x, y + height]];
          [px, py] = points[index];
        } else if (kind === "trapezoid") {
          const points = [[x + width * .22, y], [x + width * .78, y], [x + width, y + height], [x, y + height]];
          [px, py] = points[index];
        } else if (kind === "cross") {
          const points = [[.4,0],[.6,0],[.6,.4],[1,.4],[1,.6],[.6,.6],[.6,1],[.4,1],[.4,.6],[0,.6],[0,.4],[.4,.4]];
          [px, py] = [x + points[index][0] * width, y + points[index][1] * height];
        } else {
          const angle = -Math.PI / 2 + index * Math.PI * 2 / sides;
          const radius = kind === "star" && index % 2 ? 0.42 : 0.5;
          [px, py] = [x + width / 2 + Math.cos(angle) * width * radius, y + height / 2 + Math.sin(angle) * height * radius];
        }
        if (index === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      }
      context.closePath();
    } else if (kind === "heart") {
      context.moveTo(x + width / 2, y + height);
      context.bezierCurveTo(x - width * .1, y + height * .48, x + width * .12, y - height * .12, x + width / 2, y + height * .28);
      context.bezierCurveTo(x + width * .88, y - height * .12, x + width * 1.1, y + height * .48, x + width / 2, y + height);
      context.closePath();
    } else if (kind === "arrow") {
      context.moveTo(x, y + height * .3); context.lineTo(x + width * .62, y + height * .3);
      context.lineTo(x + width * .62, y); context.lineTo(x + width, y + height / 2);
      context.lineTo(x + width * .62, y + height); context.lineTo(x + width * .62, y + height * .7);
      context.lineTo(x, y + height * .7); context.closePath();
    } else if (kind === "crescent") {
      context.moveTo(x + width * .7, y + height * .08);
      context.bezierCurveTo(x + width * .25, y + height * .08, x + width * .16, y + height * .78, x + width * .55, y + height * .95);
      context.bezierCurveTo(x + width * .25, y + height * .66, x + width * .45, y + height * .23, x + width * .7, y + height * .08);
      context.closePath();
    } else if (kind === "speech-bubble") {
      context.moveTo(x + width * .16, y);
      context.lineTo(x + width * .84, y);
      context.quadraticCurveTo(x + width, y, x + width, y + height * .16);
      context.lineTo(x + width, y + height * .62);
      context.quadraticCurveTo(x + width, y + height * .78, x + width * .84, y + height * .78);
      context.lineTo(x + width * .4, y + height * .78);
      context.lineTo(x + width * .2, y + height);
      context.lineTo(x + width * .23, y + height * .78);
      context.lineTo(x + width * .16, y + height * .78);
      context.quadraticCurveTo(x, y + height * .78, x, y + height * .62);
      context.lineTo(x, y + height * .16);
      context.quadraticCurveTo(x, y, x + width * .16, y);
      context.closePath();
    } else if (kind === "cloud") {
      context.moveTo(x + width * .2, y + height * .78);
      context.bezierCurveTo(x + width * .03, y + height * .78, x + width * .03, y + height * .5, x + width * .18, y + height * .45);
      context.bezierCurveTo(x + width * .17, y + height * .1, x + width * .57, y + height * .02, x + width * .68, y + height * .33);
      context.bezierCurveTo(x + width * .95, y + height * .25, x + width * .97, y + height * .65, x + width * .82, y + height * .78);
      context.closePath();
    } else if (kind === "cylinder") {
      context.moveTo(x, y + height * .16);
      context.ellipse(x + width / 2, y + height * .16, width / 2, height * .16, 0, Math.PI, Math.PI * 2);
      context.lineTo(x + width, y + height * .84);
      context.ellipse(x + width / 2, y + height * .84, width / 2, height * .16, 0, 0, Math.PI);
      context.closePath();
      context.moveTo(x, y + height * .16);
      context.lineTo(x, y + height * .84);
      context.moveTo(x + width, y + height * .16);
      context.lineTo(x + width, y + height * .84);
    } else if (kind === "cube") {
      context.moveTo(x + width * .5, y);
      context.lineTo(x + width, y + height * .25);
      context.lineTo(x + width, y + height * .75);
      context.lineTo(x + width * .5, y + height);
      context.lineTo(x, y + height * .75);
      context.lineTo(x, y + height * .25);
      context.closePath();
      context.moveTo(x, y + height * .25);
      context.lineTo(x + width * .5, y + height * .5);
      context.lineTo(x + width, y + height * .25);
      context.moveTo(x + width * .5, y + height * .5);
      context.lineTo(x + width * .5, y + height);
      context.moveTo(x + width * .5, y + height * .5);
      context.lineTo(x + width * .5, y);
    } else if (kind === "cone") {
      context.moveTo(x + width / 2, y); context.lineTo(x + width, y + height);
      context.ellipse(x + width / 2, y + height, width / 2, height * .14, 0, 0, Math.PI);
      context.lineTo(x + width / 2, y);
    } else if (kind === "ring") {
      context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
      context.moveTo(x + width * .68, y + height / 2);
      context.ellipse(x + width / 2, y + height / 2, width * .18, height * .18, 0, 0, Math.PI * 2, true);
    } else if (kind === "spiral") {
      const turns = 3.5;
      for (let index = 0; index <= 140; index += 1) {
        const progress = index / 140;
        const angle = progress * turns * Math.PI * 2;
        const radius = progress * Math.min(width, height) * 0.48;
        const px = x + width / 2 + Math.cos(angle) * radius;
        const py = y + height / 2 + Math.sin(angle) * radius;
        if (index === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      }
    } else if (kind === "freeform" && Array.isArray(item.points)) {
      item.points.forEach((point, index) => {
        const px = point.x * this.width;
        const py = point.y * this.height;
        if (index === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      });
      context.closePath();
    } else {
      context.rect(x, y, width, height);
    }
  }

  drawShape(item) {
    const context = this.context;
    context.save();
    this.traceShape(item);
    if (item.fill && !["line", "curve", "arc", "spiral"].includes(item.shape)) {
      context.fillStyle = item.fillColor ?? item.color;
      context.fill();
    }
    context.strokeStyle = item.color;
    context.lineWidth = item.strokeWidth ?? 3;
    context.lineJoin = "round";
    context.lineCap = "round";
    if (item.stroke !== false) context.stroke();
    context.restore();
  }

  drawGuides() {
    const context = this.context;
    context.save();
    context.strokeStyle = "#7864ce";
    context.lineWidth = 1;
    context.setLineDash([5, 4]);
    context.beginPath();
    if (this.guides.x !== null) {
      const x = this.guides.x * this.width;
      context.moveTo(x, 0);
      context.lineTo(x, this.height);
    }
    if (this.guides.y !== null) {
      const y = this.guides.y * this.height;
      context.moveTo(0, y);
      context.lineTo(this.width, y);
    }
    context.stroke();
    context.restore();
  }

  drawItemOutline(item) {
    const bounds = this.itemBounds(item);
    const isSelected = this.selectedItemIds.includes(item.id);
    this.context.save();
    this.withItemRotation(this.context, item);
    this.context.strokeStyle = isSelected ? "#7864ce" : "#9a91b0";
    this.context.lineWidth = isSelected ? 2 : 1;
    this.context.setLineDash(isSelected ? [] : [4, 4]);
    this.context.strokeRect(
      bounds.x * this.width,
      bounds.y * this.height,
      bounds.width * this.width,
      bounds.height * this.height,
    );
    if (this.selectedItemIds.length === 1 && isSelected) {
      for (const handle of this.resizeHandles(bounds)) {
        this.context.beginPath();
        this.context.fillStyle = "#fffefa";
        this.context.strokeStyle = "#7864ce";
        this.context.lineWidth = 1.5;
        this.context.arc(handle.x * this.width, handle.y * this.height, 4 / this.zoom, 0, Math.PI * 2);
        this.context.fill();
        this.context.stroke();
      }
      const rotationHandle = {
        x: bounds.x + bounds.width / 2,
        y: bounds.y - 24 / (this.height * this.zoom),
      };
      this.context.beginPath();
      this.context.moveTo((bounds.x + bounds.width / 2) * this.width, bounds.y * this.height);
      this.context.lineTo(rotationHandle.x * this.width, rotationHandle.y * this.height);
      this.context.stroke();
      this.context.beginPath();
      this.context.arc(rotationHandle.x * this.width, rotationHandle.y * this.height, 5 / this.zoom, 0, Math.PI * 2);
      this.context.fill();
      this.context.stroke();
    }
    if (this.selectedItemIds.length === 1 && isSelected && item.type === "shape" && item.shape === "curve") {
      const points = item.curvePoints ?? [];
      if (points.length === 4) {
        this.context.beginPath();
        this.context.setLineDash([3, 3]);
        this.context.moveTo(points[0].x * this.width, points[0].y * this.height);
        this.context.lineTo(points[1].x * this.width, points[1].y * this.height);
        this.context.moveTo(points[3].x * this.width, points[3].y * this.height);
        this.context.lineTo(points[2].x * this.width, points[2].y * this.height);
        this.context.stroke();
        for (const index of [1, 2]) {
          const point = points[index];
          this.context.beginPath();
          this.context.setLineDash([]);
          this.context.fillStyle = "#fffefa";
          this.context.strokeStyle = "#7864ce";
          this.context.lineWidth = 1.5;
          this.context.arc(point.x * this.width, point.y * this.height, 5 / this.zoom, 0, Math.PI * 2);
          this.context.fill();
          this.context.stroke();
        }
      }
    }
    this.context.restore();
  }

  drawGroupSelectionOverlay() {
    const entries = this.transformableSelection();
    if (entries.length < 2) return;
    const bounds = this.selectionBounds(entries);
    const context = this.context;
    context.save();
    this.applyViewTransform(context);
    context.strokeStyle = "#7864ce";
    context.lineWidth = 1.5 / this.zoom;
    context.setLineDash([5 / this.zoom, 3 / this.zoom]);
    context.strokeRect(bounds.x * this.width, bounds.y * this.height,
      bounds.width * this.width, bounds.height * this.height);
    context.setLineDash([]);
    for (const handle of this.resizeHandles(bounds)) {
      context.beginPath();
      context.fillStyle = "#fffefa";
      context.strokeStyle = "#7864ce";
      context.lineWidth = 1.5 / this.zoom;
      context.arc(handle.x * this.width, handle.y * this.height, 4 / this.zoom, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    }
    const rotationHandle = this.groupRotationHandlePoint(bounds);
    context.beginPath();
    context.moveTo((bounds.x + bounds.width / 2) * this.width, bounds.y * this.height);
    context.lineTo(rotationHandle.x * this.width, rotationHandle.y * this.height);
    context.stroke();
    context.beginPath();
    context.arc(rotationHandle.x * this.width, rotationHandle.y * this.height, 5 / this.zoom, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.restore();
  }

  render({ ignoreTypeFilter = false } = {}) {
    if (!this.width || !this.height) {
      return;
    }
    const context = this.context;
    context.save();
    context.clearRect(0, 0, this.width, this.height);
    if (!this.transparentCanvas) {
      context.fillStyle = this.backgroundColor;
      context.fillRect(0, 0, this.width, this.height);
    }
    context.restore();
    for (const layer of this.layers) {
      if (!layer.visible) {
        continue;
      }
      const originalCanvas = this.canvas;
      const originalContext = this.context;
      this.canvas = this.layerCanvas;
      this.context = this.layerContext;
      this.context.save();
      this.context.setTransform(originalCanvas.width / this.width, 0, 0, originalCanvas.height / this.height, 0, 0);
      this.context.clearRect(0, 0, this.width, this.height);
      this.applyViewTransform(this.context);
      for (const item of layer.items) {
        if (item.type === "stroke" && item.tool === "eraser") continue;
        if (!ignoreTypeFilter && !this.itemMatchesType(item)) continue;
        this.drawItem(item);
      }
      this.context.restore();
      this.canvas = originalCanvas;
      this.context = originalContext;
      context.save();
      context.globalAlpha = layer.opacity ?? 1;
      context.drawImage(this.layerCanvas, 0, 0, this.width, this.height);
      context.restore();
    }

    for (const layer of this.layers) {
      if (!layer.visible || (layer.opacity ?? 1) <= 0) continue;
      const erasers = layer.items.filter((item) =>
        item.type === "stroke" && item.tool === "eraser" &&
        (ignoreTypeFilter || this.itemMatchesType(item)));
      if (!erasers.length) continue;
      context.save();
      context.globalAlpha = layer.opacity ?? 1;
      this.applyViewTransform(context);
      for (const item of erasers) this.drawItem(item);
      context.restore();
    }

    for (const layer of this.layers) {
      if (!layer.visible) continue;
      context.save();
      this.applyViewTransform(context);
      for (const item of layer.items) {
        if (!ignoreTypeFilter && !this.itemMatchesType(item)) continue;
        if (this.selectedItemIds.includes(item.id) || item.id === this.hoveredItemId) {
          this.drawItemOutline(item);
        }
      }
      context.restore();
    }

    this.drawGroupSelectionOverlay();
    context.save();
    this.applyViewTransform(context);
    if (this.interaction?.type === "marquee") {
      const start = this.interaction.start;
      const end = this.interaction.current;
      context.save();
      context.fillStyle = "rgb(129 84 246 / 12%)";
      context.strokeStyle = "#8154f6";
      context.lineWidth = 1;
      context.setLineDash([5, 4]);
      context.fillRect(
        Math.min(start.x, end.x) * this.width,
        Math.min(start.y, end.y) * this.height,
        Math.abs(end.x - start.x) * this.width,
        Math.abs(end.y - start.y) * this.height,
      );
      context.strokeRect(
        Math.min(start.x, end.x) * this.width,
        Math.min(start.y, end.y) * this.height,
        Math.abs(end.x - start.x) * this.width,
        Math.abs(end.y - start.y) * this.height,
      );
      context.restore();
    }

    if (this.interaction?.type === "drag") {
      this.drawGuides();
    }
    if (this.interaction?.type === "shape") {
      const { start, current } = this.interaction;
      this.drawShape({
        type: "shape",
        shape: this.shapeKind,
        x: Math.min(start.x, current.x),
        y: Math.min(start.y, current.y),
        width: Math.abs(current.x - start.x),
        height: Math.abs(current.y - start.y),
        color: this.brush.color,
        fill: this.shapeFill,
        stroke: this.shapeStroke,
        strokeWidth: this.brush.size,
        points: this.interaction.points,
      });
    }
    context.restore();
  }
}
