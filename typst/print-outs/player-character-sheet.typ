#set page(
  paper: "a4",
  margin: (
    top: 12mm,
    bottom: 12mm,
    left: 18mm,
    right: 18mm,
  ),
  background: context {
    grid(
      columns: (6mm,) * 36,
      rows: (6mm,) * 50,
      stroke: 0.3pt + rgb(120, 120, 120, 25%),
    )
  },
)

#set text(
  font: "Libertinus Serif",
  size: 11pt,
)

#set heading(numbering: none)

// ─────────────────────────────────────
// PAGE 1
// ─────────────────────────────────────

// Date

#align(right)[
  #pad(right: 8mm)[
    #text(size: 9pt)[Date:     ]
  ]
]

#v(1pt)

// Header

#align(center)[
  #image("../../assets/img/lp-logo.svg", width: 30mm)

  #v(2pt)

  #text(
    size: 18pt,
    weight: "bold",
    fill: rgb("#8a3c00"),
  )[Player Character Sheet]

  #v(2pt)

  #text(size: 10pt)[
    A simple sheet for taking your character into the story.
  ]
]

#v(6pt)

// Basic Information

#grid(
  columns: (1fr, 1fr),
  column-gutter: 12mm,
  align: top,

  [
    #text(fill: rgb("#8a3c00"))[*Character Name*]

    #v(3pt)
    #line(length: 100%)

    #v(7pt)

    #text(fill: rgb("#8a3c00"))[*Player*]

    #v(3pt)
    #line(length: 100%)
  ],

  [
    #text(fill: rgb("#8a3c00"))[*Story*]

    #v(3pt)
    #line(length: 100%)

    #v(7pt)

    #text(fill: rgb("#8a3c00"))[*Lore Master*]

    #v(3pt)
    #line(length: 100%)
  ],
)

#v(7pt)

// Character Background

#text(fill: rgb("#8a3c00"))[*Character Background*]

#v(3pt)

#rect(
  width: 100%,
  height: 25mm,
  stroke: 0.7pt,
  radius: 4pt,
)

#v(6pt)

// Visual Features

#text(fill: rgb("#8a3c00"))[*Visual Features of Character*]

#v(3pt)

#rect(
  width: 100%,
  height: 39mm,
  stroke: 0.7pt,
  radius: 4pt,
)

#v(6pt)

// Role

#text(fill: rgb("#8a3c00"))[*Role in the Story*]

#v(3pt)

#rect(
  width: 100%,
  height: 17mm,
  stroke: 0.7pt,
  radius: 4pt,
)

#v(6pt)

// Important Details

#text(fill: rgb("#8a3c00"))[*Important Details*]

#v(3pt)

#grid(
  columns: (1fr, 1fr),
  column-gutter: 12mm,

  [
    #text(fill: rgb("#8a3c00"))[*Relationships*]

    #v(3pt)

    #rect(
      width: 100%,
      height: 24mm,
      stroke: 0.7pt,
      radius: 4pt,
    )
  ],

  [
    #text(fill: rgb("#8a3c00"))[*Items / Notes*]

    #v(3pt)

    #rect(
      width: 100%,
      height: 24mm,
      stroke: 0.7pt,
      radius: 4pt,
    )
  ],
)

// ─────────────────────────────────────
// PAGE 2
// ─────────────────────────────────────

#pagebreak()

#align(center)[
  #text(
    size: 18pt,
    weight: "bold",
    fill: rgb("#8a3c00"),
  )[Session Notes]

  #v(3pt)

  #text(size: 10pt)[
    Notes from the Lore Play session.
  ]
]

#v(5pt)

// Decorative divider

#line(
  length: 100%,
  stroke: (
    paint: rgb("#652d00"),
    thickness: 0.7pt,
    dash: "dashed",
  ),
)

#v(1fr)

// Slogan at the bottom

#align(center)[
  #text(size: 9pt, style: "italic")[
    Play the lore. Build the story.
  ]
]