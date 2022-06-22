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
  // Restart
  // clients = [];
  // rooms = [];

  // Emit when connected (single client)
  // socket.emit("connection", rooms);
  // Client with ID has connected
  console.log(`Socket with ID: ${socket.id} has connected`);
  //   Welcome message (single client)
  socket.emit("message", "Welcome to Social fabric");

  // Broadcast when a user connects (to all clients, expect the one connecting)
  socket.broadcast.emit("message", "A user has joined the chat");
  // [To all clients in general - io.emit]
  console.log(socket.rooms);

  // CLIENT LOGIC
  // Send ID for current Client
  console.log(clients);

  // Emit client ID (single client)
  socket.emit("clientID", socket.id);
  // Emit clients to all clients
  clients.push(socket.id);
  io.emit("getAllClients", clients);

  // ROOM LOGIC
  socket.on("delete_room", (data) => {
    console.log(data);

    console.log(socket.rooms);
    const roomsArray = Array.from(socket.rooms);
    console.log(roomsArray);

    const filteredRooms = rooms.filter((room) => room.name !== data);
    rooms = filteredRooms;

    const roomNames = rooms.map((room) => {
      return room.name;
    });
    console.log(roomNames);

    io.emit("deleted_room", roomNames);
  });

  socket.on("join_room", (data) => {
    // Join room
    socket.join(data);
    console.log(socket.rooms);

    const checkRoom = rooms.filter((room) => {
      return room.name === data;
    });

    if (checkRoom.length === 0) {
      console.log("room doesn't exist");
      // Nytt rum
      const newRoom = {
        // id: v4(),
        name: data,
        messages: [],
      };
      // Pusha nytt rum
      rooms.push(newRoom);

      const roomNames = rooms.map((room) => {
        return room.name;
      });
      console.log(roomNames);

      // Skicka uppdaterade rum
      io.emit("joined_room", roomNames);
    }

    // Join room and exit room
    const roomsArray = Array.from(socket.rooms);

    if (roomsArray.length === 3) {
      const leaveRoom = roomsArray[1];
      socket.leave(leaveRoom);
    }

    const joinedRoom = rooms.find((room) => {
      return room.name === data;
    });

    console.log("joined room");
    console.log(joinedRoom);

    io.to(data).emit("current_room", joinedRoom);
  });

  // MESSAGE LOGIC
  socket.on("chatMessage", (data) => {
    console.log(rooms);
    console.log(data);
    rooms.map((room) => {
      console.log(socket.rooms);
      console.log(room.name);
      console.log(data.room);
      if (room.name === data.room) {
        const newMessage = {
          message: data.message,
          clientID: data.clientID,
          randomColor: data.randomColor,
          avatar: data.avatar,
          currentRoom: data.room,
        };
        room.messages.push(newMessage);
        data.messages = room.messages;
      }
    });
    io.to(data.room).emit("sentMessage", data);
  });

  //   This runs when clients disconnects
  socket.on("disconnect", (reason) => {
    console.log(`Socket ${socket.id} disconnected. Reason ${reason}`);
    io.emit("message", "A user has left the chat");
  });
});
