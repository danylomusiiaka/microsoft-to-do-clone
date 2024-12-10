const WebSocket = require("ws");
const User = require("../models/userModel");

let wss;

function setupWebSocketServer(server) {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    let userTeam;

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message);

        if (data.type === "init" && data.profileDetails && data.profileDetails.team) {
          userTeam = data.profileDetails.team;

          const user = await User.findOne({ team: userTeam });

          if (user) {
            ws.user = user;
            console.log(`User with team ${userTeam} connected`);
          } else {
            console.log(`No user found with team ${userTeam}`);
            ws.close();
          }
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    });
  });
}

function broadcast(message, targetTeam) {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.user) {
        if (client.user.team === targetTeam) {
          client.send(JSON.stringify(message));
        }
      }
    });
  } else {
    console.error("WebSocket server not initialized");
  }
}

module.exports = { setupWebSocketServer, broadcast };
