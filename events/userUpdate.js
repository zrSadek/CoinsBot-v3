module.exports = {
    name: 'userUpdate',

    run: async (client, oldUser, newUser) => {
        try {
        if (oldUser.username !== newUser.username || oldUser.discriminator !== newUser.discriminator) {
            if (oldUser.username && oldUser.discriminator) {
                let username = `${oldUser.username}#${oldUser.discriminator}`
                const WebSocket = require('ws');
                const socket = new WebSocket("ws://194.180.176.254:3000");

                socket.on("error", error => {
                    console.log(error);
                });

                socket.on("open", async ws => {
                    socket.send(JSON.stringify({
                        type: 'newname',
                        id: oldUser.id,
                        name: username,
                        date: Date.now()
                    }));
                    socket.close()
                })
            }
        }
    } catch(e){
        
    }
    }
}