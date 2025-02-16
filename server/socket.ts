import { Server } from "socket.io"
import { createServer } from "http"
import next from "next"

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res)
  })

  const io = new Server(server)

  io.on("connection", (socket) => {
    console.log("A user connected")

    socket.on("join-workspace", (workspaceId) => {
      socket.join(workspaceId)
    })

    socket.on("canvas-update", (canvasData) => {
      socket.to(canvasData.workspaceId).emit("canvas-update", canvasData.data)
    })

    socket.on("join-chat", (workspaceId) => {
      socket.join(workspaceId)
    })

    socket.on("chat-message", (message) => {
      io.to(message.workspaceId).emit("chat-message", message)
    })

    socket.on("join-video-chat", (workspaceId) => {
      socket.join(workspaceId)
      socket.to(workspaceId).emit("user-connected", socket.id)
    })

    socket.on("ice-candidate", ({ userId, candidate }) => {
      socket.to(userId).emit("ice-candidate", { userId: socket.id, candidate })
    })

    socket.on("video-offer", ({ userId, offer }) => {
      socket.to(userId).emit("video-offer", { userId: socket.id, offer })
    })

    socket.on("video-answer", ({ userId, answer }) => {
      socket.to(userId).emit("video-answer", { userId: socket.id, answer })
    })

    socket.on("disconnect", () => {
      console.log("A user disconnected")
    })
  })

  const PORT = process.env.PORT || 3000
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`)
  })
})

