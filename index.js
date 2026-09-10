const bedrock = require("bedrock-protocol");
const settings = require("./settings.json");

let client = null;
let reconnecting = false;

function log(message) {
    console.log(`[BOT] ${message}`);
}

function startBot() {

    log(`Connecting to ${settings.host}:${settings.port}...`);

    try {

        client = bedrock.createClient({
            host: settings.host,
            port: settings.port,
            username: settings.username,
            offline: true
        });

        client.on("join", () => {

            reconnecting = false;

            log("Successfully joined the Bedrock server!");

        });

        client.on("text", (packet) => {

            if (packet.message) {
                console.log(`[CHAT] ${packet.message}`);
            }

        });

        client.on("disconnect", (packet) => {

            log("Bot disconnected from server.");

            reconnect();

        });

        client.on("error", (error) => {

            log(`Error: ${error.message}`);

        });

    } catch (error) {

        log(`Connection failed: ${error.message}`);

        reconnect();

    }
}


function reconnect() {

    if (!settings.reconnect) return;

    if (reconnecting) return;

    reconnecting = true;

    log(`Reconnecting in ${settings.reconnectDelay / 1000} seconds...`);

    setTimeout(() => {

        reconnecting = false;

        startBot();

    }, settings.reconnectDelay);
}


process.on("SIGINT", () => {

    log("Bot stopped.");

    if (client) {
        client.close();
    }

    process.exit();
});


startBot();
