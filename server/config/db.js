const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./db.sqlite", (error) => {
  if (error) {
    console.error(error.message);
    throw error;
  }
});

db.exec("PRAGMA foreign_keys = ON;", (err) => {
  if (err) console.error(err.message);
});

const room = `CREATE TABLE IF NOT EXISTS rooms (id INTEGER PRIMARY KEY AUTOINCREMENT, room_name TEXT UNIQUE, time TEXT)`;

const user = `CREATE TABLE IF NOT EXISTS users (id TEXT, username TEXT PRIMARY KEY, active_room TEXT)`;

const message = `CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT NOT NULL, username TEXT, room_name TEXT, user_id TEXT, avatar TEXT, color TEXT, time TEXT,
  CONSTRAINT fk_room_name 
  FOREIGN KEY(room_name) 
  REFERENCES rooms(room_name)
  ON DELETE CASCADE
  )`;

db.run(room, (error) => {
  if (error) {
    console.error(error.message);
    throw error;
  } else {
    console.log("Rooms table already created");
  }
});

db.run(user, (error) => {
  if (error) {
    console.error(error.message);
    throw error;
  } else {
    console.log("Users table already created");
  }
});

db.run(message, (error) => {
  if (error) {
    console.error(error.message);
    throw error;
  } else {
    console.log("Messages table already created");
  }
});

module.exports = db;
