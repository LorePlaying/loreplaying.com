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
      #text(size: 21pt, weight: "bold", fill: ink)[Player Character Sheet]
      #v(2pt)
      #text(size: 9pt, fill: ink)[
        Take your character into the story.
      ]
    ],
    [
      #align(right)[
        #text(size: 18pt, weight: "bold", fill: red)[PC]
      ]
    ],
  )
]

#v(6mm)

#grid(
  columns: (1fr, 1fr),
  column-gutter: 8mm,
  [
    #label[Character Name]
    #v(2mm)
    #rule-line

    #v(7mm)
    #label[Player]
    #v(2mm)
    #rule-line
  ],
  [
    #label[Story]
    #v(2mm)
    #rule-line

    #v(7mm)
    #label[Lore Master]
    #v(2mm)
    #rule-line
  ],
)

#v(6mm)

#label[Character Background]
#v(3mm)
#field(18mm)

#v(4mm)

#label[Visual Features of Character]
#v(3mm)
#field(28mm)

#v(4mm)

#label[Role in the Story]
#v(3mm)
#field(12mm)

#v(4mm)

#label[Important Details]
#v(3mm)

#grid(
  columns: (1fr, 1fr),
  column-gutter: 8mm,
  [
    #label[Relationships]
    #v(2mm)
    #field(22mm)
  ],
  [
    #label[Items / Notes]
    #v(2mm)
    #field(22mm)
  ],
)

#v(5mm)

#grid(
  columns: (1fr, 1fr),
  column-gutter: 8mm,
  [
    #text(size: 7.5pt, fill: muted)[PAGE 01 / CHARACTER]
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
  Character \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  Session \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
]

#v(5mm)
#rule-line
#v(5mm)

#grid(
  columns: (1fr, 42mm),
  column-gutter: 8mm,
  [
    #label[Character Journal]
  ],
  [
    #label[New Details]
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
