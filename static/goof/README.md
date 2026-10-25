# GOOF

GOOF is a lightweight, browser-based infinite canvas for quick sketches. It is
built with plain HTML, CSS, JavaScript modules, and the native Canvas API.

## Run locally

Serve the project root with any static HTTP server. For example:

```powershell
python -m http.server 8000
```

Or in VS Code, install the Live Server extension, right-click `index.html`, and
choose **Open with Live Server**. Serving over HTTP enables the app's local
IndexedDB autosave; artwork is kept in the browser on this device.

## Tools

- **Pan**: drag the canvas. Hold Space to pan temporarily.
- **Select**: select, move, and resize objects.
- **Draw** and **Eraser**: freehand tools with adjustable color and size.
- **Shapes**: rectangle, ellipse, line, triangle, and arrow.
- **Text**: click or tap the canvas and type; press Enter to finish and
  Shift+Enter for a new line.
- **Zoom**: use the mouse wheel or pinch gesture; the zoom controls are in the
  lower-right corner.
- **Export**: use the three-dot menu to download the drawing as PNG or SVG.

Keyboard shortcuts: V (select), D (draw), E (eraser), H (pan), T (text),
Ctrl/Cmd+Z (undo), and Ctrl/Cmd+Shift+Z (redo).

## Project structure

- `index.html` — minimal canvas and tool controls
- `style.css` — responsive, light/dark interface styles
- `src/simple.js` — app interactions, IndexedDB autosave, and toolbar behavior
- `src/drawing.js` — drawing engine, canvas gestures, history, and exports
- `rust-engine/` — existing Rust/WebAssembly crate; the minimal canvas app does
  not require a Rust build to run
