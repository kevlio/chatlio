const fs = require("fs");

function logMessages(data) {
  console.log(data);
  const fsData = JSON.stringify(data);

  fs.appendFile("log.txt", fsData + "\n", (error) => {
    if (error) {
      return console.log("Error, failed to write to log.txt");
    } else {
      return console.log("Success, wrote to log.txt");
    }
  });
}

module.exports = logMessages;
