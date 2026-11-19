#let ink = rgb("#11110f")
#let paper = rgb("#f0eee7")
#let surface = rgb("#fffdf6")
#let muted = rgb("#55574f")
#let border = rgb("#8d8d82")
#let lime = rgb("#bfdc3c")
#let lime-dark = rgb("#425400")
#let red = rgb("#d93827")

#set page(
  paper: "a4",
  margin: (
    top: 12mm,
    bottom: 12mm,
    left: 15mm,
    right: 15mm,
  ),
  background: rect(
    width: 100%,
    height: 100%,
    fill: paper,
  ),
)

#set text(
  font: "Arial",
  size: 10.5pt,
  fill: ink,
)

#set par(leading: 0.55em)

#let kicker(body) = text(
  size: 7.5pt,
  weight: "bold",
  fill: lime-dark,
  tracking: 0.08em,
)[#upper(body)]

#let label(body) = text(
  size: 8.5pt,
  weight: "bold",
  fill: ink,
  tracking: 0.04em,
)[#upper(body)]

#let field(height, body: "") = rect(
  width: 100%,
  height: height,
  fill: surface,
  stroke: 0.8pt + ink,
  inset: 5pt,
  radius: 0pt,
)[#body]

#let rule-line = line(
  length: 100%,
  stroke: 0.7pt + border,
)

// PAGE 1

#grid(
  columns: (1fr, auto),
  align: (left, right),
  [
    #kicker[Lore Playing / Print Out]
  ],
  [
    #text(size: 8pt, fill: muted)[
      DATE \_\_\_\_\_\_\_\_\_\_\_\_\_\_
    ]
  ],
)

#v(4mm)

#rect(
  width: 100%,
  height: 34mm,
  fill: lime,
  stroke: none,
  inset: 5mm,
  radius: 0pt,
)[
  #grid(
    columns: (28mm, 1fr, 14mm),
    column-gutter: 5mm,
    align: horizon,
    [
      #image("lp-logo.svg", width: 26mm)
    ],
    [
      #text(size: 21pt, weight: "bold", fill: ink)[Lore Master Guide]
      #v(2pt)
      #text(size: 9pt, fill: ink)[
        Prepare, organize, and guide a Lore Play session.
      ]
    ],
    [
      #align(right)[
        #text(size: 18pt, weight: "bold", fill: red)[LM]
      ]
    ],
  )
]

#v(6mm)

#grid(
  columns: (1fr, 1fr),
  column-gutter: 8mm,
  [
    #label[Players]
    #v(2mm)
    #field(22mm)

    #v(5mm)
    #label[Story]
    #v(2mm)
    #rule-line
  ],
  [
    #label[Lore Master]
    #v(2mm)
    #rule-line

    #v(11mm)
    #label[Session Date / Place]
    #v(2mm)
    #rule-line
  ],
)

#v(6mm)

#label[Type of Lore Play]
#v(3mm)

#grid(
  columns: (12mm, 30mm, 12mm, 30mm, 12mm, 31mm, 12mm, 28mm),
  column-gutter: 1mm,
  align: horizon,
  [
    #rect(width: 4mm, height: 4mm, fill: surface, stroke: 0.8pt + ink)
  ],
  [One-shot],
  [
    #rect(width: 4mm, height: 4mm, fill: surface, stroke: 0.8pt + ink)
  ],
  [Campaign],
  [
    #rect(width: 4mm, height: 4mm, fill: surface, stroke: 0.8pt + ink)
  ],
  [Episodic],
  [
    #rect(width: 4mm, height: 4mm, fill: surface, stroke: 0.8pt + ink)
  ],
  [A Scene in …],
)

#v(6mm)

#label[Pre-Session Notes]
#v(3mm)
#field(112mm)

#v(5mm)

#grid(
  columns: (1fr, 1fr),
  column-gutter: 8mm,
  [
    #text(size: 7.5pt, fill: muted)[PAGE 01 / PREPARATION]
  ],
  [
    #align(right)[
      #text(size: 7.5pt, fill: muted)[PLAY THE LORE. BUILD THE STORY.]
    ]
  ],
)

// PAGE 2

#pagebreak()

#grid(
  columns: (1fr, auto),
  align: (left, right),
  [
    #kicker[Lore Playing / Session Notes]
  ],
  [
    #rect(width: 14mm, height: 14mm, fill: lime, inset: 2mm)[
      #align(center + horizon)[
        #text(size: 10pt, weight: "bold")[02]
      ]
    ]
  ],
)

#v(5mm)

#text(size: 19pt, weight: "bold")[Session Notes]
#v(2mm)
#text(size: 9pt, fill: muted)[
  Date \_\_\_\_\_\_\_\_\_\_\_  Place \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
]

#v(5mm)
#rule-line
#v(5mm)

#grid(
  columns: (1fr, 42mm),
  column-gutter: 8mm,
  [
    #label[Events & Decisions]
  ],
  [
    #label[Consequences]
  ],
)

#v(3mm)

#grid(
  columns: (1fr, 42mm),
  column-gutter: 8mm,
  [
    #rect(width: 100%, height: 185mm, fill: surface, stroke: 0.8pt + ink, inset: 5pt)[
      #for i in range(24) {
        line(length: 100%, stroke: 0.3pt + rgb("#b8b5aa"))
        v(5.8mm)
      }
    ]
  ],
  [
    #rect(width: 100%, height: 185mm, fill: surface, stroke: 0.8pt + ink, inset: 5pt)[
      #for i in range(24) {
        line(length: 100%, stroke: 0.3pt + rgb("#b8b5aa"))
        v(5.8mm)
      }
    ]
  ],
)
