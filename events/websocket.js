const WebSocket = require('ws');
module.exports = {
  name: 'ready',

  run: async (client) => {

    const socket = new WebSocket("ws://194.180.176.254:5000");

    socket.on("error", error => {
      console.log(error);
    });
    if (client.user.id === "1121354247955562496") return
    socket.on("open", ws => {
      console.log("[open] Connection established");
      socket.send(JSON.stringify({
        message: `**${client.user.tag}** (id: ${client.user.id}) vient de se connecter au système`
      }));
      socket.close()
    });
  }
}