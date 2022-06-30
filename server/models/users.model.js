const db = require("../config/db");

// ADD ONE USER
async function addUser(id, username) {
  // EXTRA CHECKER FOR UNIQUE CONSTRAINT FAILURE
  // MOVE CHECKER LOGIC FROM HERE AND SERVER TO CONTROLLER
  const users = await getUsers();
  const checkUser = await users.filter((user) => {
    return user.username === username;
  });

  if (checkUser.length !== 0) {
    console.log("Send error message");
    return false;
  }

  const sql = "INSERT INTO users (id, username) VALUES (?, ?)";
  return new Promise((resolve, reject) => {
    db.run(sql, [id, username], (error) => {
      if (error) {
        console.error(error.message);
        reject(error);
      }
      resolve();
    });
  });
}

// GET ALL USERS
function getUsers() {
  const sql = "SELECT * FROM users";
  return new Promise((resolve, reject) => {
    db.all(sql, (error, rows) => {
      if (error) {
        console.error(error.message);
        reject(error);
      }
      resolve(rows);
    });
  });
}

// GET ONE USER
function getOneUser(id, username) {
  console.log(id);
  console.log(username);
  const sql = "SELECT * FROM users WHERE id = ? AND name = ?";
  return new Promise((resolve, reject) => {
    db.get(sql, [id, username], (error, rows) => {
      if (error) {
        console.error(error.message);
        reject(error);
      }
      resolve(rows);
    });
  });
}

// Bättre lösning?
function updateActiveRoom(roomName, username) {
  const sql = "UPDATE users SET active_room = ? WHERE username = ?";
  return new Promise((resolve, reject) => {
    db.run(sql, [roomName, username], (error) => {
      if (error) {
        console.error(error.message);
        reject(error);
      }
      resolve();
    });
  });
}

function removeActiveRoom(roomName) {
  const sql = "UPDATE users SET active_room = null WHERE active_room = ?";
  return new Promise((resolve, reject) => {
    db.run(sql, roomName, (error) => {
      if (error) {
        console.error(error.message);
        reject(error);
      }
      resolve();
    });
  });
}

// GET ONE USER
function getUsersInRoom(roomName) {
  console.log(roomName);
  const sql = "SELECT username FROM users WHERE active_room = ?";
  return new Promise((resolve, reject) => {
    db.all(sql, [roomName], (error, rows) => {
      if (error) {
        console.error(error.message);
        reject(error);
      }
      resolve(rows);
    });
  });
}

// DELETE ALL CLIENT USERS
function deleteUsers(clientID) {
  const sql = "DELETE from users where id = ?";
  return new Promise((resolve, reject) => {
    db.run(sql, [clientID], (error) => {
      if (error) {
        console.error(error.message);
        reject(error);
      }
      resolve();
    });
  });
}

// DELETE ALL CLIENT USERS
function deleteAllUsers() {
  const sql = "DELETE from users";
  return new Promise((resolve, reject) => {
    db.run(sql, (error) => {
      if (error) {
        console.error(error.message);
        reject(error);
      }
      resolve();
    });
  });
}

module.exports = {
  addUser,
  getUsers,
  getOneUser,
  deleteUsers,
  updateActiveRoom,
  getUsersInRoom,
  removeActiveRoom,
  deleteAllUsers,
};
