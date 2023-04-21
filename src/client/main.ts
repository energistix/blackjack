import { Player } from "../server/main"
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
const pseudo = localStorage.getItem("pseudo") as string
let houseCardScreen: cardScreen
let myCardScreen: cardScreen

socket.on("connect", () => {
  socket.emit("playerData", {
    pseudo
  })
  const myScreen = document.getElementById("player") as HTMLDivElement
  myCardScreen = new cardScreen(pseudo)
  myScreen.appendChild(myCardScreen.mainElement)

  const houseScreen = document.getElementById("house") as HTMLDivElement
  houseCardScreen = new cardScreen()
  houseScreen.appendChild(houseCardScreen.mainElement)
  houseCardScreen.enable()
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

  delete() {
    this.mainElement.remove()
  }

  set turned(value: boolean) {
    this._turned = value
    this.mainElement.src = value
      ? "/cards/back.png"
      : `/cards/${this.kind}_${this.suite}.png`
    this.updateValue()
  }
}

class cardScreen {
  mainElement: HTMLDivElement
  valueElement: HTMLParagraphElement
  cards: Card[] = []
  cardListElement: HTMLDivElement
  waitingElement: HTMLDivElement | null
  turnLastCard = false

  constructor(public pseudo = "The house") {
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

    this.valueElement.classList.add("disabled")
    this.cardListElement.classList.add("disabled")

    this.waitingElement = document.createElement("div")
    this.waitingElement.innerText = "Waiting..."
    this.waitingElement.classList.add("waiting")
    this.mainElement.appendChild(this.waitingElement)

    for (let i = 0; i < 6; i++) {
      const img = document.createElement("img")
      img.src = "/cards/back.png"
      this.cardListElement.appendChild(img)
    }
  }

  setCards(cards: [string, string][]) {
    for (const card of this.cards) card.delete()
    this.cards = []

    for (const [kind, suite] of cards) this.addCard(kind, suite)
    if (this.turnLastCard && this.cards[this.cards.length - 1])
      this.cards[this.cards.length - 1].turned = true
    this.drawValue()
  }

  askCard(){
    const yesButton = document.createElement("input")
    yesButton.type = "button"
    yesButton.innerHTML = "yes"
    yesButton.addEventListener("click", ()=>{
      socket.emit("cardAsked", true)
      remove()
    })
    const noButton = document.createElement("input")
    noButton.type = "button"
    noButton.innerHTML = "no"
    noButton.addEventListener("click", ()=>{
      socket.emit("cardAsked", false)
      remove()
    })
    const text = document.createElement("div")
    text.innerHTML = "Want a card ?"
    this.mainElement.appendChild(text)
    text.appendChild(yesButton)
    text.appendChild(noButton)

    function remove(){
      yesButton.remove()
      noButton.remove()
      text.remove()
    }
  }

  enable() {
    this.valueElement.classList.remove("disabled")
    this.cardListElement.classList.remove("disabled")

    this.waitingElement?.remove()
    for (const child of Array.from(this.cardListElement.children)) {
      child.remove()
    }
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

    while (_value > 21 && aces > 0) {
      _value -= 10
      aces--
    }

    return _value
  }

  addCard(kind: string, suite: string, turned = false) {
    const card = new Card(kind, suite, turned)
    this.cards.push(card)
    this.cardListElement.appendChild(card.mainElement)
    this.drawValue()
  }

  drawValue() {
    this.valueElement.textContent = `${this.pseudo}'s cards value : ${this.value}`
  }
}

socket.on("playersData", (playersData: Player[]) => {
  for (const playerData of playersData) {
    if (playerData.id === "house") {
      houseCardScreen.setCards(playerData.cards)
    }

    if(playerData.id === socket.id){
      myCardScreen.enable()
      myCardScreen.setCards(playerData.cards)
    }
  }
})

socket.on("askCard", ()=>{
  myCardScreen.askCard()
})

socket.on("houseTurn", ()=>{
  houseCardScreen.cards[houseCardScreen.cards.length - 1].turned = false
  houseCardScreen.turnLastCard = false
})