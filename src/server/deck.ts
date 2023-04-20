const cardKinds = [
  ...Array.from(Array(10).keys())
    .map((x) => x + 1)
    .map(String),
  "K",
  "Q",
  "J"
]

const suits = ["heart", "diamond", "spade", "club"]
const defaultCards = suits
  .map((suit) => cardKinds.map((cardKind) => [cardKind, suit]))
  .flat()

export default class Deck {
  cardTitles: string[][] = []
  constructor(private allCards = false) {
    if (allCards) this.cardTitles = defaultCards.concat()
  }

  shuffle() {
    this.cardTitles = this.cardTitles.sort(() => Math.random() - 0.5)
  }

  draw() {
    return this.cardTitles.shift()
  }

  reset() {
    if (this.allCards === true) this.cardTitles = defaultCards.concat()
    else this.cardTitles = []
  }
}

export function cardValue(title: string) {
  const v = title.split("_")[0]
  if (Number.isNaN(v)) return 10
  else return Number(v)
}
