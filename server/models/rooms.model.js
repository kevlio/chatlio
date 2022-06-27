const db = require("../config/db");

// ADD ONE ROOM
function addRoom(roomName) {
  const sql = "INSERT INTO rooms (room_name) VALUES (?)";
  return new Promise((resolve, reject) => {
    db.run(sql, [roomName], (error) => {
      if (error) {
        console.error(error.message);
        reject(error);
      }
      resolve();
    });
  });
}

function getRooms() {
  const sql = "SELECT * FROM rooms";
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

// // DELETE ONE ROOM
function deleteRoom(roomName) {
  const sql = "DELETE from rooms where room_name = ?";
  return new Promise((resolve, reject) => {
    db.run(sql, [roomName], (error, rows) => {
      if (error) {
        console.error(error.message);
        reject(error);
      }
      resolve(rows);
    });
  });
}

module.exports = {
  addRoom,
  deleteRoom,
  getRooms,
};
