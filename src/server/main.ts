import express from "express"
import ViteExpress from "vite-express"
import { createServer } from "http"
import { Server } from "socket.io"

const app = express()
const server = createServer(app)
const io = new Server(server, {})

interface Player {
  pseudo: string
  id: string
}

const players: Player[] = []

io.on("connection", (socket) => {
  socket.once("playerData", (data) => {
    if (!data["pseudo"]) return
    players.push({
      ...data,
      id: socket.id
    })
  })
})

ViteExpress.bind(app, server)
server.listen(8080, () => {
  console.log("Listening.")
})
