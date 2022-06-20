const { Server } = require("socket.io");

const io = new Server(4000, {
  /* options */
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`Socket with ID: ${socket.id} has connected`);
  //   Welcome message (single client)
  socket.emit("message", "Welcome to Social fabric");
  socket.emit("clientID", socket.id);
  // Broadcast when a user connects (to all clients, expect the one connecting)
  socket.broadcast.emit("message", "A user has joined the chat");
  // To all clients in general - io.emit //

  //   This runs when clients disconnects
  socket.on("disconnect", (reason) => {
    console.log(`Socket ${socket.id} disconnected. Reason ${reason}`);
    io.emit("message", "A user has left the chat");
  });

  //   Send message test
  socket.on("chatMessage", ({ message, clientID, randomColor }) => {
    // console.log(`${socket.id} has sent message: ${data}`);
    io.emit("chatMessage", { message, clientID, randomColor });
    io.emit("id", socket.id);
  });
});
