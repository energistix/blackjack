import express from "express"
import ViteExpress from "vite-express"
import { createServer } from "http"
import { Server } from "socket.io"
import Deck from "./deck"

const app = express()
const server = createServer(app)
const io = new Server(server, {})

export interface Player {
  pseudo: string
  id: string
  cards: [string, string][]
  inCurrentGame: boolean
  cardAsked: boolean
  doneWithCards: boolean
}

const players: Player[] = [
  {
    pseudo: "house",
    id: "house",
    cards: [],
    inCurrentGame: true,
    cardAsked: false,
    doneWithCards: false
  }
]

const globalDeck = new Deck(true)
globalDeck.shuffle()

function updateCards() {
  io.sockets.emit("playersData", players)
}

function startGame() {
  globalDeck.reset()
  globalDeck.shuffle()

  for (const player of players) {
    player.cards = []
    player.inCurrentGame = true
  }

  for (const player of players)
    for (let i = 0; i < 2; i++) player.cards.push(globalDeck.draw())

  updateCards()
  startCardAskingPhase()
}

function house(){
  io.emit("houseTurn")
  
  const housePlayer = players.find(player=>player.id === "house");
  if(!housePlayer) throw new Error("No house somehow ???")
  while(cardsValue(housePlayer.cards) < 17){
    housePlayer.cards.push(globalDeck.draw())
  }
  updateCards()
}

io.on("connection", (socket) => {
  socket.once("playerData", (data) => {
    if (!data["pseudo"]) return
    players.push({
      ...data,
      id: socket.id,
      deck: [],
      inCurrentGame: false
    })
    if (players.length === 2) {
      startGame()
    }

    socket.on("cardAsked", (wantCard) => {
      const player = players.find((player) => player.id === socket.id)
      if (!player?.cardAsked) return
      player.cardAsked = false
      if (wantCard) {
        player.cards.push(globalDeck.draw())
        updateCards()
      }else{
        player.doneWithCards = true
        if(players.every(player=>{
          if(player.id==="house") return true
          return player.doneWithCards
        })) house()
      }
    })

    socket.onAny((ev, ...data) => {
      console.log(`${socket.id} : ${ev} : ${data}`)
    })
  })

  socket.on("disconnect", () => {
    players.splice(
      players.findIndex((player) => player.id === socket.id),
      1
    )
    if (
      !players.some((player) => {
        return player.inCurrentGame && player.id !== "house"
      })
    ) {
      startGame()
    }
  })
})

ViteExpress.bind(app, server)
server.listen(8080, () => {
  console.log("Listening.")
})

function startCardAskingPhase() {
  //TODO: ask for bets

  for (const player of players) {
    if (!player.inCurrentGame) continue
    if (cardsValue(player.cards) == 21) {
      //TODO: give 1.5* initial bet
      player.inCurrentGame = false
      continue
    }
    // send a message to socket with player.id as it's id
    player.cardAsked = true
    const socket = io.to(player.id)
    socket.emit("askCard", player.cards)
  }
}

function cardsValue(cards: [string, string][]) {
  let _value = 0
  let aces = 0

  const values = cards.map(([kind]) => {
    let value
    if (kind === "1") value = 11
    else if (Number.isNaN(Number(kind))) value = 10
    else value = Number.parseInt(kind)
    return value
  })

  for (const value of values) {
    _value += value
    if (value === 11) {
      aces++
    }
  }

  while (_value > 21 && aces > 0) {
    _value -= 10
    aces--
  }

  return _value
}
