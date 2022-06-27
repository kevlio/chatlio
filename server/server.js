const { Server } = require("socket.io");
const { DateTime } = require("luxon");
const messagesModel = require("./models/messages.model");
const usersModel = require("./models/users.model");
const roomsModel = require("./models/rooms.model");

const io = new Server(4000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  const users = await usersModel.getUsers();
  const rooms = await roomsModel.getRooms();

  io.emit("connection", { users, rooms });

  socket.on("error", (errorMessage) => {
    io.emit("errorMessage", errorMessage);
  });

  socket.on("register", async (registerUsername) => {
    const users = await usersModel.getUsers();

    const checkUser = users.filter((user) => {
      return user.username === registerUsername;
    });
    if (checkUser.length !== 0) {
      socket.emit("errorMessage", "User already exist");
      return;
    }
    usersModel.addUser(socket.id, registerUsername);
    io.emit("register", { user_id: socket.id, username: registerUsername });
    io.emit("getUsers", users);
  });

  // ROOM LOGIC

  socket.on("join_room", async ({ roomName, username }) => {
    // Join room
    socket.join(roomName);

    const updatedRooms = await roomsModel.getRooms();

    const checkRoom = updatedRooms.filter((room) => {
      return room.room_name === roomName;
    });

    if (checkRoom.length === 0) {
      roomsModel.addRoom(roomName);
      const updatedRooms = await roomsModel.getRooms();

      // Skicka uppdaterade rum
      io.emit("joined_room", updatedRooms);
    }

    // Join room and exit room
    const roomsArray = Array.from(socket.rooms);

    if (roomsArray.length === 3) {
      const leaveRoom = roomsArray[1];
      socket.leave(leaveRoom);
    }

    await usersModel.updateActiveRoom(roomName, username);

    const usersRoomUpdated = await usersModel.getUsers();
    io.emit("getUsers", usersRoomUpdated);

    const roomMessages = await messagesModel.getRoomMessages(roomName);
    io.to(roomName).emit("current_room", roomMessages);
  });

  socket.on("delete_room", async (roomName) => {
    // Delete room in database
    // Would be cool to solve with Foreign Key
    await roomsModel.deleteRoom(roomName);
    await messagesModel.deleteRoomMessages(roomName);
    const updatedRooms = await roomsModel.getRooms();
    io.emit("deleted_room", updatedRooms);
  });

  // MESSAGE LOGIC
  socket.on("chatMessage", async (data) => {
    if (data.username.length === 0) {
      socket.emit("errorMessage", "Please enter a username");
      return;
    }
    if (data.message.length === 0) {
      socket.emit("errorMessage", "Please enter a message");
      return;
    }

    const timeStamp = DateTime.now().toLocaleString(DateTime.DATETIME_MED);

    const newMsg = {
      message: data.message,
      username: data.username,
      user_id: data.clientID,
      room_name: data.room,
      color: data.randomColor,
      avatar: data.avatar,
      time: timeStamp,
    };
    messagesModel.addMessage(newMsg);

    const roomMessages = await messagesModel.getRoomMessages(data.room);
    io.to(data.room).emit("sentMessage", roomMessages);
  });

  //   This runs when clients disconnects
  socket.on("disconnect", (reason) => {
    console.log(`Socket ${socket.id} disconnected. Reason ${reason}`);
    io.emit("message", "A user has left the chat");
  });
});
