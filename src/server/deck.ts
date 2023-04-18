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
  .map((suit) => cardKinds.map((cardKind) => `${cardKind}_${suit}`))
  .flat()

export default class Deck {
  cardTitles: string[] = defaultCards.concat()
  constructor() {}
}

export function cardValue(title: string) {
  //TODO: 1 card can be valued 11 if it advantages the player
  //not sure if this should be managed here yet
  const v = title.split("_")[0]
  if (Number.isNaN(v)) return 10
  else return Number(v)
}
