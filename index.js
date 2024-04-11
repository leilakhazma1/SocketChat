const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);

// Store the nicknames of connected users
let users = {};

// Serve the index.html file when the root URL is requested
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Handle connections from clients
io.on('connection', (socket) => {
    console.log('a user connected');

    // Listen for 'new user' event from the client and store the nickname
    socket.on('new user', (nickname) => {
        users[socket.id] = nickname;
        // Broadcast to all clients that a new user has joined
        io.emit('user joined', nickname);
        // Send the list of online users to all clients
        io.emit('user online', Object.values(users));
    });

    // Listen for 'chat message' event from the client and broadcast the message
    socket.on('chat message', (msg) => {
        io.emit('chat message', { user: users[socket.id], msg: msg });
    });

    // Listen for 'disconnect' event and remove the user from the list of online users
    socket.on('disconnect', () => {
        io.emit('user left', users[socket.id]);
        delete users[socket.id];
        // Send the updated list of online users to all clients
        io.emit('user online', Object.values(users));
    });

    // Listen for 'typing' event from the client and broadcast to all clients
    socket.on('typing', () => {
        io.emit('typing', users[socket.id]);
    });
});

// Start the server and listen on port 3000
server.listen(3000, () => {
    console.log('listening on *:3000');
});
