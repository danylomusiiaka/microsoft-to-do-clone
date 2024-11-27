const WebSocket = require("ws");

let wss;

function setupWebSocketServer(server) {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      console.log("Received:", message);
    });
  });
}

function broadcast(message) {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  } else {
    console.error("WebSocket server not initialized");
  }
}

module.exports = { setupWebSocketServer, broadcast };
