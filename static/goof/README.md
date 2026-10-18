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
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
Push-Location .\rust-engine
wasm-pack build --target web --out-dir pkg --out-name goof_rust_engine
Pop-Location
```

Putting rustup's Cargo shim first ensures wasm-pack uses the toolchain with the
WebAssembly target installed. Generated JavaScript bindings and WebAssembly
files are written to `rust-engine/pkg/`. This generated build output is
excluded by `rust-engine/.gitignore`; rebuild it after changing the Rust crate.
The browser loads the generated module directly, so no bundler is necessary.

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
- `src/library.js` — browser-local IndexedDB storage for projects, notes, assets, and collections
- `rust-engine/Cargo.toml` — Rust crate manifest and wasm-bindgen dependency
- `rust-engine/Cargo.lock` — pinned Rust dependency versions
- `rust-engine/src/lib.rs` — Rust brush-pressure and Markdown document parsing exported to JavaScript
- `rust-engine/pkg/` — generated wasm-pack output; include this directory in
  the files served by a static deployment when Rust/WASM features are enabled

## Artwork notes

Each local artwork has a Notes panel in the top toolbar. Its notes are
autosaved with the artwork in IndexedDB, including the recovery record. Notes
saved explicitly as Plain Text or Markdown also create standalone note entries
in the Home screen's Saved Notes section. Artwork notes and standalone notes
are local to this browser and are not included in an exported `.goof` scene.

The Notes panel closes when you click outside it or choose another tool.
**Save note** opens Plain Text and Markdown format choices; saving creates a
new local Saved Notes entry and downloads the corresponding `.txt` or `.md`
file. **Ctrl+E** switches the focused editor to Preview and **Ctrl+O** opens
in-note search. The Notes editor has a small Normal/Insert keyboard mode with
motions (`h/j/k/l`, `w/b`, `0`, `$`), insert commands (`i`, `a`, `o`), line
delete/yank/paste (`dd`, `yy`, `p`), and undo (`u`). Press **Esc** to enter
Normal mode and **i** to return to Insert mode.

The Edit and Preview modes support headings, paragraphs, emphasis, inline and
fenced code, ordered and unordered lists, block quotes, and links. The Rust
WASM module parses Markdown into a typed JSON document; JavaScript creates
preview DOM nodes using text content rather than inserting generated HTML.
Only safe `http:`, `https:`, `mailto:`, and relative links are activated. Raw
HTML is displayed as text.

Rebuild the WASM package after changing the Rust Notes parser using the
`wasm-pack build` command above. If the generated module or Notes parser is
unavailable, note editing and saving still work and Preview uses the built-in
JavaScript Markdown parser.

`rust-engine/pkg/` is generated output and is ignored by Git. A static host
such as GitHub Pages must receive that generated directory as part of its
published files; this repository does not currently define an automatic WASM
build/deploy workflow.

## Current features

- Local Home gallery with search, grid/list layouts, portrait/landscape and
  Infinite canvas presets, document dimensions, white/black/
  transparent/custom backgrounds, artwork previews, and
  create/open/rename/duplicate/delete actions
- Home displays standalone Saved Notes and non-empty notes attached to artwork;
  selecting an artwork note opens its artwork and Notes editor
- Infinite canvases allow drawing, moving, and resizing beyond the initial
  viewport bounds; SVG export frames visible artwork content
- Named artwork and an autosave safety copy stored locally in IndexedDB; canvas
  documents can be saved to the gallery and reopen with their layers and
  imported image data
- Per-artwork Notes with autosave, Edit/Preview modes, and Rust/WASM Markdown
  parsing when the generated module is available
- Select, brush, eraser, shape, and fill tools; Select moves, resizes, and
  rotates individual objects, and moves multi-selections together
- Keyboard tool shortcuts: **B** Brush, **E** Eraser, **S** Select, **R**
  Rectangle, **F** Fill, **T** on-canvas text, **L** Layers, **A** Assets,
  **N** Notes, and **C** Clear Canvas; shortcuts pause while typing in fields
  or dialogs. Choose **Keyboard shortcuts** in Actions and settings for the
  complete list.
- Searchable command palette on **Ctrl+Shift+P**, **/**, or **`**, with keyboard
  navigation to tools, panels, every shape and brush type, artwork actions, and
  Notes commands, including **Toggle Notes Vim mode**
- Notes Vim mode is available from the Notes header or command palette; its
  Green/Amber CRT theme provides a blinking block cursor and Normal/Insert
  editing with common movement, line, word, yank/paste, change, replace,
  delete, undo, and redo commands. Press **/** in Normal mode to search the
  current note, **n/N** to repeat, and **Ctrl+E** to toggle Edit/Preview.
- Standalone Notes can be saved as Plain Text or Markdown; saved notes are
  stored in the local library and can be reopened from Notes or the Home page.
- The Home page uses a lightweight, theme-aware animated line-and-node web
  that stays fixed to the viewport as the page scrolls, reacts to pointer
  movement, and uses lavender accents in both themes; it respects reduced
  motion. Artwork and note lists load separately from the asset library so the
  Home page can populate without waiting for asset initialization. The GOOF
  Studio wordmark has a brief, reduced-motion-aware glitch effect. About GOOF
  is available from both Home and the drawing workspace, with an animated,
  circular CRT signal display that pauses when the dialog is closed.
- Clear Canvas offers Circling, Dots, and Spinner animations. Choose an effect
  in the Clear Canvas options and optionally remember it on this device.
- Object-aware eraser: tapping a shape, image, or text object deletes it;
  brush eraser strokes punch through the visible composite across layers
- Hold Space and drag to pan; pinch with two fingers to pan and zoom on touch
  screens
- Three focused brush styles: smooth Ink, textured Crayon, and a soft,
  lightweight Airbrush; double-click Brush or Eraser for size and tip
  settings and double-click Brush to choose a style
- Brush size and opacity affect new strokes; touch pressure adjusts stroke width
- A compact shape picker with circles, symbols, curves, and configurable
  regular polygons with 3–12 sides; Circle stays circular when drawn
- A Fill bucket with Smart, Canvas-only, and Shape-only targets; filled
  backgrounds and shapes participate in undo, scene saves, PNG, and SVG exports
- Clear offers animated Circling, Dots, and Spinner effects before
  resetting layer contents and the canvas background; double-click Clear to
  choose an effect, and enable Remember to use it on the next single click.
  Clearing can be undone.
- Drawing with mouse, touch, and stylus via Pointer Events
- Multiple visible, lockable, draggable/reorderable layers with per-layer
  opacity; click a layer name to edit its options
- Movable brush strokes, shapes, text, and images; resize or rotate them with
  their on-canvas handles, including larger, easier-to-hit edge resize zones
- Right-click a selected object on desktop, or double-tap it on touch screens,
  to open Duplicate, Edit, and Delete actions
- Editable text and draggable imported images with alignment snapping guides
- Drop supported image files or image assets onto the canvas to place them on a
  new, named layer
- Local Assets for reusable text, images, drawings, and shapes, with search,
  type filters that also filter canvas visibility, multi-collection filtering,
  and collection management;
  **Show assets → Save selection or layer to Assets** saves every item on the
  active layer, or saves a multi-selection as one group asset with its relative
  arrangement intact
- Automatic local recovery snapshots stored in IndexedDB
- Undo/redo buttons and Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y, Ctrl+A, Escape, and Delete
  keyboard shortcuts; Ctrl+A selects all visible, unlocked canvas objects as a
  group
- A purpose-built painting workspace with compact grouped tools across the top,
  a vertical brush-size/opacity rail on larger screens, and a touch-friendly
  horizontal rail on phones
- Floating Actions, double-click brush settings, Colour Studio, and contextual
  Layers/Assets panels; assets are grouped and filtered by type
- Dark, translucent workspace styling by default, with an optional light theme
- Shared HSV colour wheel and eyedropper-style colour controls for brush, text,
  and shape colours, with a white-to-black value slider, Apply action, and
  saved palette slots
- New shapes default to no fill; filled shapes open with their saved fill
  colour, and the Fill colour control provides a No fill action
- British English interface copy (`en-GB`)
- Editable shape outline width, and canvas text entry that commits with Enter
  while Shift+Enter inserts a line break
- Version 0.2
- Compact floating Layers and Assets panel with separate tabs and outside-click
  or Escape dismissal
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

## Prototype boundaries

GOOF remains a lightweight drawing prototype rather than a full raster-painting
studio. Its artwork gallery and named documents are functional and stored in
IndexedDB. Canvas dimensions determine the displayed canvas ratio and PNG/SVG
export dimensions. Layers are editable object layers with visibility and
opacity; brush strokes are retained as editable paths rather than independently
composited raster bitmaps. Brush settings contain Ink, Crayon, and Airbrush
presets; advanced brush simulation, smudge, blend modes, project
cloud sync, and JPEG/WebP export dialogs are not implemented.

Open **Actions and settings** and choose **Save and export** to export an
editable `.goof` scene, PNG, or SVG. Open **Show assets** to save objects to
**Assets**. With multiple canvas objects selected, Assets stores
them together as a group so that relative spacing is preserved when placed
again. Otherwise it saves the active layer's items. If exactly one collection
is selected, the new assets are filed into it. The JSON-based `.goof` format preserves
editable layers, objects, visibility, opacity, and embedded images; use
**Open** to load it again. SVG is useful for vector interchange, while PNG
creates a raster image.

## Layers, text, and Assets

- Choose **New layer** in the Layers panel to create a layer. Select a layer to
  draw on it; click its name to edit the name, visibility, lock, and opacity.
  Drag the grip to reorder layers or delete a layer with its delete button.
- Use **Select** to click and drag an object or draw a marquee across multiple
  objects. Hold Shift while clicking or marquee-selecting to add/remove objects
  from the selection. Selected objects move together. Drag the corner handles
  to resize (the full edge is a hit target) and the handle above an object to rotate it. Use **Text** to add a
  text object. Double-click text or select it and choose **Edit text**.
- Choose **Image** to import an image. It is added to Assets and placed on the
  canvas. Open **Show assets** and choose **Save selection or layer to Assets**
  to save the active layer's items as reusable
  assets, or multi-select objects first to store their relative layout in a
  single group asset. Click an asset to select it and use its **+** button to
  add a copy. Click **Text**, **Images**, **Shapes**, or **Drawings** to filter
  both the Assets list and visible canvas items; choose **All** to restore all
  types.
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
  to choose Smart, Canvas-only, or Shape-only behaviour. Double-click a shape
  to edit its fill and outline colours; independent Fill and Outline switches
  can disable either style. Shape options also set fill/outline defaults for
  newly drawn shapes. The Fill colour picker can also remove a fill. Clear
  also resets a filled background.
- Use the zoom slider at the bottom of the canvas or hold Ctrl while scrolling
  the mouse wheel over the canvas. Canvas pixel dimensions and zoom are shown
  separately.
- Hold Space and drag the canvas to pan; use two fingers to pan and zoom on a
  touch screen. Ctrl+mouse-wheel zooms the canvas.
- Choose **Text** to type directly into the on-canvas text cursor. Click away
  or press Ctrl+Enter to place it, then double-click the text to edit it.
  Double-click badges on Brush/Eraser and Shapes indicate their extra settings.
- Open **Actions and settings** for theme, fullscreen, import, text, and export
  controls; press Escape or choose fullscreen again to return to the workspace.
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
