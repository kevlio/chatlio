const db = require("../config/db");

function addMessage({
  message,
  username,
  user_id,
  room_name,
  color,
  avatar,
  time,
}) {
  const sql =
    "INSERT INTO messages (message, username, user_id, room_name, color, avatar, time) VALUES (?, ?, ?, ?, ?, ?, ?)";
  return new Promise((resolve, reject) => {
    db.run(
      sql,
      [message, username, user_id, room_name, color, avatar, time],
      (error) => {
        if (error) {
          console.error(error.message);
          reject(error);
        }
        resolve();
      }
    );
  });
}

function getRoomMessages(roomName) {
  const sql = "SELECT * FROM messages WHERE room_name = ?";
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

// // DELETE ONE ROOM
function deleteRoomMessages(roomName) {
  const sql = "DELETE from messages where room_name = ?";
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
  addMessage,
  deleteRoomMessages,
  getRoomMessages,
};
