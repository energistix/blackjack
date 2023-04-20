import "./style.css"
import { io } from "socket.io-client"
const socket = io()

if (localStorage.getItem("pseudo") === null) {
  let pseudo
  while (!pseudo) {
    pseudo = prompt("Quel est vottre pseudo ?")
  }
  localStorage.setItem("pseudo", pseudo)
}
const pseudo = localStorage.getItem("pseudo")

socket.on("connect", () => {
  socket.emit("playerData", {
    pseudo
  })
  const myScreen = document.getElementById("player") as HTMLDivElement
  const myCardScreen = new cardScreen()
  myScreen.appendChild(myCardScreen.mainElement)
})

class Card {
  mainElement: HTMLImageElement
  value: number = 0
  _turned: boolean = false

  constructor(public kind: string, public suite: string, turned = false) {
    this.mainElement = document.createElement("img")
    this.mainElement.classList.add("card")
    this.turned = turned
    this.updateValue()
  }

  updateValue() {
    if (this._turned) this.value = 0
    else if (this.kind === "1") this.value = 11
    else if (Number.isNaN(Number(this.kind))) this.value = 10
    else this.value = Number.parseInt(this.kind)
  }

  set turned(value: boolean) {
    this._turned = value
    this.mainElement.src = value
      ? "/cards/back.png"
      : `/cards/${this.kind}_${this.suite}.png`
  }
}

class cardScreen {
  mainElement: HTMLDivElement
  valueElement: HTMLParagraphElement
  cards: Card[] = []
  cardListElement: HTMLDivElement

  constructor(pseudo = "") {
    this.mainElement = document.createElement("div")
    this.mainElement.classList.add("card-screen")

    const pseudoElement = document.createElement("p")
    pseudoElement.textContent = pseudo
    this.mainElement.appendChild(pseudoElement)

    this.valueElement = document.createElement("p")
    this.drawValue()
    this.mainElement.appendChild(this.valueElement)

    this.cardListElement = document.createElement("div")
    this.cardListElement.classList.add("card-list")
    this.mainElement.appendChild(this.cardListElement)
  }

  get value() {
    let _value = 0
    let aces = 0

    for (const card of this.cards) {
      _value += card.value
      if (card.value === 11) {
        aces++
      }
    }
    console.log(_value, aces)

    while (_value > 21 && aces > 0) {
      _value -= 10
      aces--
    }

    console.log(_value, aces)

    return _value
  }

  addCard(kind: string, suite: string, turned = false) {
    const card = new Card(kind, suite, turned)
    this.cards.push(card)
    this.cardListElement.appendChild(card.mainElement)
    this.drawValue()
  }

  drawValue() {
    this.valueElement.textContent = `Vos cartes valent : ${this.value}`
  }
}
