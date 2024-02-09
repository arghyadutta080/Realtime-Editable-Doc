const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("a user connected with id: " + socket.id);

    socket.on('join_room', (room) => {              // users joining the same room to get connected with the same document
        socket.join(room.id);
    })

    socket.on('send_message', (arg) => {            // main functionality of socket.io -> emit received message to clientsite just after getting the sent message from users (from clientsite) without req-res
        console.log(arg.id, arg.delta);
        socket.to(arg.id).emit('receive_msg', arg.delta);
    });
});

httpServer.listen(3001, () => {
    console.log("listening on *:3001");
});