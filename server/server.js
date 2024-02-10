const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { docs } = require("./model/document");
const { connectionDB } = require("./config/db");
const { configDotenv } = require("dotenv");

const app = express();

app.use(cors());
configDotenv();

connectionDB();

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: { 
        origin: "http://localhost:5173",
        credentials: true
    }
});
 
io.on("connection", (socket) => {
    console.log("a user connected with id: " + socket.id);

    socket.on('join_room', async (room) => {              // users joining the same room to get connected with the same document
        socket.join(room.id);
        const docData = await findOrCreateDoc(room.id); 
        socket.emit('get_doc', docData);  // emit the document to the clientsite just after joining the room    
        
    })
    
    socket.on('save_doc', async (arg) => { 
        console.log("save dov", arg.id, arg.data);
        await docs.findByIdAndUpdate(arg.id, { data: arg.data });         
    });
    
    socket.on('send_message', (arg) => {            // main functionality of socket.io -> emit received message to clientsite just after getting the sent message from users (from clientsite) without req-res
        console.log(arg.id, arg.delta);
        socket.to(arg.id).emit('receive_msg', arg.delta);
    });


});
 
const defaultData = {
    ops: [
        {
            insert: "Start typing here..."
        }
    ]
}

const findOrCreateDoc = async (id) => {
    console.log("findOrCreateDoc", id)
    if(id == null) return;
    const document = await docs.findById(id);
    console.log(document);
    if(document) return document;
    const newDoc = new docs({ _id: id, data: defaultData}); 
    await newDoc.save();
    return newDoc;
}

httpServer.listen(3001, () => {  
    console.log("listening on *:3001");
});