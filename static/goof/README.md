# GOOF

GOOF (Goofy Scribbles for Lore Playing) is a lightweight, open-source,
browser-based drawing application built with plain HTML, CSS, JavaScript
modules, and the native Canvas API.

## Requirements

- A modern browser
- Rust and Cargo, installed with rustup
- The `wasm32-unknown-unknown` Rust target
- `wasm-pack`, for building the browser-compatible WebAssembly package
- Visual Studio C++ Build Tools with the MSVC linker (Windows)
- A local static HTTP server (Python is optional)

The Rust crate's only added dependency is `wasm-bindgen`. It generates the
JavaScript bindings needed to call an exported Rust function from the browser.
`wasm-pack` is a separate Rust command-line build tool, not a frontend
dependency. No bundler or frontend framework is used.

## Install the Rust/WASM tools on Windows

In PowerShell, install the Rust toolchain with WinGet:

```powershell
winget install --id Rustlang.Rustup --exact
```

Install the MSVC build tools from WinGet:

```powershell
winget install --id Microsoft.VisualStudio.2022.BuildTools --exact
```

In Visual Studio Installer, find **Build Tools 2022**, choose **Modify**, and
select the **Desktop development with C++** workload, including the MSVC
x64/x86 build tools and a Windows SDK. Installing the Build Tools package
without this workload does not install the compiler and linker. After the
workload is installed, open **Developer PowerShell for VS 2022** to build: it
puts Microsoft's `link.exe` on `PATH` ahead of other tools. A regular shell may
resolve Git for Windows' unrelated `link.exe` instead.

In Developer PowerShell, add the browser WebAssembly target and install
wasm-pack:

```powershell
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
rustup target add wasm32-unknown-unknown
cargo install wasm-pack
```

## Build the WebAssembly package

From the project root, run:

```powershell
Push-Location .\rust-engine
wasm-pack build --target web --out-dir pkg --out-name goof_rust_engine
Pop-Location
```

Generated JavaScript bindings and WebAssembly files are written to
`rust-engine/pkg/`. This generated build output is excluded by
`rust-engine/.gitignore`; rebuild it after changing the Rust crate. The browser
loads the generated module directly, so no bundler is necessary.

Run the Rust unit tests from the project root with:

```powershell
cargo test --manifest-path .\rust-engine\Cargo.toml
```

## Run locally

The app uses JavaScript modules and loads its WebAssembly package from a
separate file, so serve it over HTTP rather than opening `index.html` directly
as a `file://` URL. Python is just one optional way to start a local static
server; it is not an application dependency.

In VS Code, you can install the **Live Server** extension by Ritwick Dey, then
right-click `index.html` and choose **Open with Live Server**. It will open the
app at a local HTTP address, usually <http://127.0.0.1:5500>.

Alternatively, if Python is already installed, run this from the project root:

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000> in a browser. Any other local static HTTP
server also works. Without a built WASM package, the page still starts but
reports that it is using standard brush sizing until the Rust package is built.

## Project structure

- `index.html` — accessible application shell and drawing controls
- `style.css` — responsive interface styles and theme variables
- `src/main.js` — application state and WASM module initialization
- `src/drawing.js` — high-DPI canvas drawing, pointer input, resizing, and PNG export
- `src/library.js` — browser-local IndexedDB storage for image assets and collections
- `rust-engine/Cargo.toml` — Rust crate manifest and wasm-bindgen dependency
- `rust-engine/Cargo.lock` — pinned Rust dependency versions
- `rust-engine/src/lib.rs` — Rust brush-pressure calculation exported to JavaScript
- `rust-engine/pkg/` — generated wasm-pack output (not committed)

## Current features

- Select, brush, eraser, shape, and fill tools; Select moves, resizes, and
  rotates individual objects, and moves multi-selections together
- Hold Space and drag to pan; pinch with two fingers to pan and zoom on touch
  screens
- Nine brush styles, including calligraphy, airbrush, oil, crayon, marker,
  pencil, and watercolour; double-click Brush or Eraser for size and tip
  settings, or double-click Brush to choose a style from its icon picker
- A shape picker with circles, polygons, symbols, and 3D-like primitives;
  double-click or double-tap a shape to edit its fill and outline colors
- A Fill bucket with Smart, Canvas-only, and Shape-only targets; filled
  backgrounds and shapes participate in undo, scene saves, PNG, and SVG exports
- Clear resets both layer contents and the canvas background, and can be undone
- Drawing with mouse, touch, and stylus via Pointer Events
- Multiple visible, lockable, draggable/reorderable layers with per-layer
  opacity; click a layer name to edit its options
- Movable brush strokes, shapes, text, and images; resize or rotate them with
  their on-canvas handles
- Editable text and draggable imported images with alignment snapping guides
- Local Assets for reusable text, images, scribbles, and shapes, with search,
  category filters, multi-collection filtering, and collection management;
  **Save → Assets** saves every item on the active layer
- Automatic local recovery snapshots stored in IndexedDB
- Undo/redo buttons and Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y, Ctrl+A, Escape, and Delete
  keyboard shortcuts; Ctrl+A selects all visible, unlocked canvas objects as a
  group
- Simple icon-only and Studio labeled workspace views; mobile screens default
  to Simple mode; the Assets and Layers sections have recognizable icons, and
  the sidebar can be collapsed
- Custom color wheel and eyedropper-style color controls; save chosen colors
  into empty palette slots for brushes and text
- Collapsible left sidebar to give the canvas more room
- Rust/WASM pressure-sensitive effective brush width, when the generated
  package is available; mouse input uses full brush size
- High-DPI rendering and stroke-preserving canvas resize
- Separate canvas dimensions and adjustable zoom slider up to 1000%, with
  Ctrl+mouse-wheel zoom over the canvas; optional transparent canvas, editable
  `.goof` scene save/open, SVG export, and PNG export
- About dialog with GOOF, Lore Playing, and creator information
- Responsive layout with touch-friendly controls

Assets, collections, and automatic recovery snapshots are local to the browser
and origin where GOOF is served; there is no account, cloud sync, or server-side
storage. Browser privacy settings or clearing site data can remove them.

Choose **Save** to export an editable `.goof` scene, PNG, or SVG, or save every
item on the active layer to **Assets**. If exactly one collection is selected,
the new assets are filed into it. The JSON-based `.goof` format preserves
editable layers, objects, visibility, opacity, and embedded images; use
**Open** to load it again. SVG is useful for vector interchange, while PNG
creates a raster image.

## Layers, text, and prop library

- Choose **New layer** in the Layers panel to create a layer. Select a layer to
  draw on it; click its name to edit the name, visibility, lock, and opacity.
  Drag the grip to reorder layers or delete a layer with its delete button.
- Use **Select** to click and drag an object or draw a marquee across multiple
  objects. Hold Shift while clicking or marquee-selecting to add/remove objects
  from the selection. Selected objects move together. Drag the corner handles
  to resize and the handle above an object to rotate it. Use **Text** to add a
  text object. Double-click text or select it and choose **Edit text**.
- Choose **Image** to import an image. It is added to Assets and placed on the
  canvas. Choose **Save → Assets** to save the active layer's items as reusable
  assets. Click an asset to select it and use its **+** button to add a copy.
  Hold Shift or Ctrl/Cmd to multi-select assets; use Select all, Add selected,
  or Delete selected as needed. Use **+** to create
  collections, the pencil control to rename them, and the adjacent **×** or
  **−** button to delete a collection. Search and collapsible category filters
  narrow the asset list.
- Choose a shape from the picker by double-clicking the active shape button;
  each shape has its own icon. Drag on the canvas to draw, then GOOF switches
  to Select so the new shape can be moved. Select a Curve and drag its visible
  control handles to bend it. The **Fill** tool's Smart mode fills a supported
  shape under the pointer or changes the canvas background; double-click Fill
  to choose Smart, Canvas-only, or Shape-only behavior. Double-click a shape
  to edit its fill and outline colors. Clear also resets a filled background.
- Use the zoom slider at the bottom of the canvas or hold Ctrl while scrolling
  the mouse wheel over the canvas. Canvas pixel dimensions and zoom are shown
  separately.
- Hold Space and drag the canvas to pan; use two fingers to pan and zoom on a
  touch screen. Ctrl+mouse-wheel zooms the canvas.
- Choose **Text** to type directly into the on-canvas text cursor. Click away
  or press Ctrl+Enter to place it, then double-click the text to edit it.
  Double-click badges on Brush/Eraser and Shapes indicate their extra settings.
- Use the fullscreen button beside the theme switch to show the drawing
  toolbar and canvas in browser fullscreen; press Escape or click it again to
  return to the full workspace.
- Drag a layer's grip handle to reorder it; use its name to open the options
  dialog, or the eye to toggle visibility. Locking or
  hiding the last editable layer does not create a new layer. The
  checkerboard button toggles a transparent canvas.
- Click a panel heading to collapse or expand it. Use the sun/moon button in
  the header to switch themes; GOOF remembers the theme in this browser.
- Use **Hide sidebar** in the left panel to collapse it and expand the drawing
  area; choose **Show panel** on the canvas to restore it.
- Use **Simple** to keep every drawing tool available with icons only, or
  **Studio** to show tool labels. The sidebar can be collapsed independently.
  Undo and redo are available from the toolbar or keyboard.

## Next development stages

1. Test pressure response with real touch and stylus hardware.
2. Refine drawing workflows and add further tools based on user feedback.
3. Evaluate whether additional performance-sensitive logic belongs in Rust.
