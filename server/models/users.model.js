const db = require("../config/db");

// ADD ONE USER
function addUser(id, username) {
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

module.exports = {
  addUser,
  getUsers,
  getOneUser,
  updateActiveRoom,
  getUsersInRoom,
};
