const { Server } = require("socket.io");
const { v4 } = require("uuid");

const io = new Server(4000, {
  /* options */
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Flyttas till databas sen
let clients = [];
let rooms = [];

io.on("connection", (socket) => {
  // Emit when connected (single client)
  socket.emit("connection");
  // Client with ID has connected
  console.log(`Socket with ID: ${socket.id} has connected`);
  //   Welcome message (single client)
  socket.emit("message", "Welcome to Social fabric");

  // Broadcast when a user connects (to all clients, expect the one connecting)
  socket.broadcast.emit("message", "A user has joined the chat");
  // [To all clients in general - io.emit]

  // CLIENT LOGIC
  // Send ID for current Client

  console.log(clients);

  // Emit client ID (single client)
  socket.emit("clientID", socket.id);
  // Emit clients to all clients
  clients.push(socket.id);
  io.emit("getAllClients", clients);

  // ROOM LOGIC
  socket.on("add_room", (data) => {
    const newRoom = {
      // id: v4(),
      name: data,
      messages: [],
    };
    rooms.push(newRoom);

    // Vad gör socket.join egentligen?
    socket.join(data);

    socket.emit("current_room", newRoom);

    io.to(data).emit("added_room", rooms);
  });

  socket.on("join_room", (data) => {
    // data: string med rumnamnet
    console.log(`${socket.id} has joined ${data}`);

    // Gå med i ett rum
    socket.join(data);

    // Berättar för alla i rummet som lyssnar på "joined_room"
    // att socketen med detta id't har gått med
    io.to(data).emit("joined_room", { id: socket.id, room: data });

    // Skriver ut rummen socketen är med i
    console.log(socket.rooms);
  });

  // MESSAGE LOGIC
  //   Send message test
  socket.on("chatMessage", (data) => {
    console.log(rooms);

    console.log(data);

    rooms.map((room) => {
      if (room.name === data.currentRoom) {
        const newMessage = {
          message: data.message,
          clientID: data.clientID,
          randomColor: data.randomColor,
          avatar: data.avatar,
          currentRoom: data.currentRoom,
        };
        room.messages.push(newMessage);
        data.messages = room.messages;
      }
    });

    console.log(data.currentRoom);

    io.to(data.currentRoom).emit("chatMessage2", data);

    // console.log(avatar);
    // io.emit("chatMessage", {
    //   message,
    //   clientID,
    //   randomColor,
    //   avatar,
    //   currentRoom,
    // });

    // socket.join();

    // io.emit("id", socket.id);
  });

  //   This runs when clients disconnects
  socket.on("disconnect", (reason) => {
    console.log(`Socket ${socket.id} disconnected. Reason ${reason}`);
    io.emit("message", "A user has left the chat");
  });
});
