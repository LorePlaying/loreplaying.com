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
  )[Lore Master Guide]

  #v(2pt)

  #text(size: 10pt)[
    A simple guide for preparing and managing a Lore Play session.
  ]
]

#v(6pt)

// Basic Information

#grid(
  columns: (1fr, 1fr),
  column-gutter: 12mm,
  align: top,

  // LEFT — Players

  [
    #rect(
      width: 100%,
      height: 24mm,
      fill: rgb(235, 235, 235),
      stroke: none,
      radius: 4pt,
      inset: 5pt,
    )[
      #text(fill: rgb("#8a3c00"))[*Players*]
    ]
  ],

  // RIGHT — Story / Lore Master

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

// Type of Lore Play

#text(fill: rgb("#8a3c00"))[*Type of Lore Play*]

#v(4pt)

#grid(
  columns: (
    auto, auto,
    auto, auto,
    auto, auto,
    auto, auto,
  ),
  column-gutter: 4mm,
  align: horizon,

  [
    #rect(
      width: 4mm,
      height: 4mm,
      stroke: 0.7pt,
      radius: 1pt,
    )
  ],

  [One-shot],

  [
    #rect(
      width: 4mm,
      height: 4mm,
      stroke: 0.7pt,
      radius: 1pt,
    )
  ],

  [Campaign],

  [
    #rect(
      width: 4mm,
      height: 4mm,
      stroke: 0.7pt,
      radius: 1pt,
    )
  ],

  [Episodic],

  [
    #rect(
      width: 4mm,
      height: 4mm,
      stroke: 0.7pt,
      radius: 1pt,
    )
  ],

  [A Scene in …],
)

#v(7pt)

// Pre-Session Notes

#text(fill: rgb("#8a3c00"))[*Pre-Session Notes*]

#v(3pt)

#rect(
  width: 100%,
  height: 135mm,
  stroke: 0.7pt,
  radius: 4pt,
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