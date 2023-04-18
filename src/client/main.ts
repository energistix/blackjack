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
})
