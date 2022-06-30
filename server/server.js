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

io.use((socket, next) => {
  socket.on("chat_message", (data) => {
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
    const users = await usersModel.getUsers();
    const checkUser = users.filter((user) => {
      return user.username === registerUsername;
    });
    if (checkUser.length !== 0) {
      socket.emit("error_message", "User already exist");
      return;
    }
    usersModel.addUser(socket.id, registerUsername);
    const updatedUsers = await usersModel.getUsers();
    io.emit("get_users", updatedUsers);

    socket.emit("registered", {
      user_id: socket.id,
      username: registerUsername,
    });
  });

  socket.on("delete_users", async (clientID) => {
    await usersModel.deleteUsers(clientID);
    const updatedUsers = await usersModel.getUsers();
    io.emit("get_users", updatedUsers);
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

  // Vässa denna
  socket.on("handle_typing", ({ typingState, username, room }) => {
    socket.to(room).emit("is_typing", { typingState, username });
  });

  // MESSAGE LOGIC
  socket.on("chat_message", async (data) => {
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
    messagesModel.addMessage(newMsg);

    socket.emit("logMessages", newMsg);

    const roomMessages = await messagesModel.getRoomMessages(data.room);
    io.to(data.room).emit("sent_message", roomMessages);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket ${socket.id} disconnected. Reason ${reason}`);
    io.emit("message", "A user has left the chat");
  });
});
