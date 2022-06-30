const { Server } = require("socket.io");
const { DateTime } = require("luxon");

const messagesModel = require("./models/messages.model");
const usersModel = require("./models/users.model");
const roomsModel = require("./models/rooms.model");

const logMessages = require("./middleware/utils");

const io = new Server(4000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Logger
io.use((socket, next) => {
  socket.on("chat_message", (data) => {
    const timeStamp = DateTime.now().toLocaleString(DateTime.DATETIME_MED);
    if (
      !data.message ||
      !data.username ||
      !data.room ||
      !data.randomColor ||
      !data.avatar
    ) {
      logMessages({
        Error: "Not valid data object",
        client: socket.id,
        time: timeStamp,
      });
      next();
      return;
    }
    const newMsg = {
      message: data.message.length ? data.message : "Error, missing message",
      username: data.username.length
        ? data.username
        : "Error, missing username",
      user_id: data.clientID.length
        ? data.clientID
        : "Error, missing client id",
      room_name: data.room.length ? data.room : "Error, missing room",
      color: data.randomColor.length
        ? data.randomColor
        : "Error, missing color",
      avatar: data.avatar.length ? data.avatar : "Error, missing avatar",
      time: timeStamp,
    };
    logMessages(newMsg);
  });
  next();
});

io.on("connection", async (socket) => {
  const users = await usersModel.getUsers();
  const rooms = await roomsModel.getRooms();

  io.emit("connection", { users, rooms });

  socket.on("error", (errorMessage) => {
    io.emit("error_message", errorMessage);
  });

  socket.on("register", async (registerUsername) => {
    if (!registerUsername) {
      return socket.emit("error_message", "No username sent");
    }
    const users = await usersModel.getUsers();
    const checkUser = await users.filter((user) => {
      return user.username === registerUsername;
    });

    // If user exist send error message
    if (checkUser.length !== 0) {
      console.log("Sent error message: user already exist");
      return socket.emit("error_message", "User already exist");
    }
    // Add user if not exist
    if (checkUser.length === 0) {
      await usersModel.addUser(socket.id, registerUsername);
      const updatedUsers = await usersModel.getUsers();
      io.emit("get_users", updatedUsers);

      socket.emit("registered_user", {
        user_id: socket.id,
        username: registerUsername,
      });
    }
  });

  socket.on("delete_users", async (clientID) => {
    await usersModel.deleteUsers(clientID);
    const updatedUsers = await usersModel.getUsers();
    io.emit("get_users", updatedUsers);
    // Remove registered users connected to socket.id
    socket.emit("registered_user", "");
    io.emit("active_users", "");
  });

  socket.on("delete_all_users", async () => {
    await usersModel.deleteAllUsers();
    const updatedUsers = await usersModel.getUsers();
    io.emit("get_users", updatedUsers);
    // Remove all registered users
    socket.emit("registered_user", "");
  });

  // Handles both create and join room
  socket.on("join_room", async ({ roomName, username }) => {
    if (!roomName) {
      return socket.emit("error_message", "No room sent");
    }
    if (!username) {
      return socket.emit("error_message", "Choose a username first");
    }
    socket.join(roomName);
    const updatedRooms = await roomsModel.getRooms();
    const checkRoom = await updatedRooms.filter((room) => {
      return room.room_name === roomName;
    });

    // Add room if not exist
    if (checkRoom.length === 0) {
      await roomsModel.addRoom(roomName);
      const updatedRooms = await roomsModel.getRooms();
      io.emit("joined_room", updatedRooms);
    }

    // Send to client registered room succeded
    socket.emit("registered_room", { room_name: roomName });
    // Join room and exit room
    const roomsArray = Array.from(socket.rooms);
    if (roomsArray.length === 3) {
      const leaveRoom = roomsArray[1];
      socket.leave(leaveRoom);
    }

    await usersModel.updateActiveRoom(roomName, username);
    const activeUsers = await usersModel.getUsersInRoom(roomName);
    io.to(roomName).emit("active_users", activeUsers);

    const usersRoomUpdated = await usersModel.getUsers();
    io.emit("get_users", usersRoomUpdated);

    const roomMessages = await messagesModel.getRoomMessages(roomName);
    io.to(roomName).emit("current_room", roomMessages);
  });

  socket.on("delete_room", async (roomName) => {
    await usersModel.removeActiveRoom(roomName);
    await roomsModel.deleteRoom(roomName);
    const updatedRooms = await roomsModel.getRooms();
    io.emit("deleted_room", updatedRooms);
    const activeUsers = await usersModel.getUsersInRoom(roomName);
    io.to(roomName).emit("active_users", activeUsers);
  });

  socket.on("handle_typing", ({ typingState, username, room }) => {
    if (username && room) {
      socket.to(room).emit("is_typing", { typingState, username });
    }
    if (!username && !room) {
      socket.emit("error_message", "Choose username and a room");
    }
    if (!username && room) {
      socket.emit("error_message", "Please enter a username");
    }
    if (!room && username) {
      socket.emit("error_message", "Please enter a room");
    }
  });

  socket.on("chat_message", async (data) => {
    if (!data.username || !data.clientID) {
      socket.emit("error_message", "Invalid data object");
      return;
    }
    if (!data.username.length) {
      socket.emit("error_message", "Please enter a username");
      return;
    }
    if (!data.message.length) {
      socket.emit("error_message", "Please enter a message");
      return;
    }
    if (!data.room.length) {
      socket.emit("error_message", "Please enter a room");
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
    await messagesModel.addMessage(newMsg);

    socket.emit("logMessages", newMsg);

    const roomMessages = await messagesModel.getRoomMessages(data.room);
    io.to(data.room).emit("sent_message", roomMessages);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket ${socket.id} disconnected. Reason ${reason}.`);
    io.emit("message", "A user has left the chat");
  });
});
