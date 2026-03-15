const express = require("express");
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let players = {};

io.on("connection", (socket) => {

    console.log("user connected:", socket.id);

    players[socket.id] = {
        x: Math.random()*800,
        y: Math.random()*600
    };

    io.emit("state", players);

    socket.on("move", (data)=>{

        if(players[socket.id]){
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
        }

        io.emit("state", players);
    });

    socket.on("collision",(data)=>{

        io.emit("playChord", data);

    });

    socket.on("disconnect", ()=>{

        console.log("user disconnected");

        delete players[socket.id];

        io.emit("state", players);

    });

});

http.listen(PORT, ()=>{

    console.log("server running on port", PORT);

});