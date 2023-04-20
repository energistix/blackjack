import express from "express"
import ViteExpress from "vite-express"
import { createServer } from "http"
import { Server } from "socket.io"
import Deck from "./deck"

const app = express()
const server = createServer(app)
const io = new Server(server, {})

interface Player {
  pseudo: string
  id: string
  cards: string[]
  inCurrentGame: boolean
}

const players: Player[] = [
  {
    pseudo: "house",
    id: "house",
    cards: [],
    inCurrentGame: true
  }
]

const globalDeck = new Deck(true)
globalDeck.shuffle()

io.on("connection", (socket) => {
  socket.once("playerData", (data) => {
    if (!data["pseudo"]) return
    players.push({
      ...data,
      id: socket.id,
      deck: [],
      inCurrentGame: players.length === 1
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
      for (const player of players) {
        player.inCurrentGame = true
      }
    }
  })
})

io.on("disconnect", () => {
  console.log("")
})

ViteExpress.bind(app, server)
server.listen(8080, () => {
  console.log("Listening.")
})
