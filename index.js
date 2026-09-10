const bedrock = require("bedrock-protocol");
const settings = require("./settings.json");
const { startLeaveRejoin, stopLeaveRejoin } = require("./leaveRejoin");
const { log, error } = require("./logger");

let client = null;
let reconnectTimer = null;
let manuallyClosing = false;

function startBot() {
    manuallyClosing = false;

    log(`Connecting to ${settings.host}:${settings.port}...`);

    try {
        client = bedrock.createClient({
            host: settings.host,
            port: settings.port,
            username: settings.username,
            offline: true
        });

        client.on("join", () => {
            log("Bot successfully joined the Bedrock server!");

            // Leave/Rejoin system start
            startLeaveRejoin(client, () => {
                startBot();
            });
        });

        client.on("text", (packet) => {
            if (packet.message) {
                log(`[CHAT] ${packet.message}`);
            }
        });

        client.on("disconnect", () => {
            log("Bot disconnected.");

            stopLeaveRejoin();

            if (!manuallyClosing) {
                reconnect();
            }
        });

        client.on("error", (err) => {
            error(err.message);
        });

    } catch (err) {
        error(`Connection failed: ${err.message}`);
        reconnect();
    }
}

function reconnect() {
    if (!settings.reconnect) return;

    if (reconnectTimer) return;

    const delay = settings.reconnectDelay || 10000;

    log(`Reconnecting in ${delay / 1000} seconds...`);

    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        startBot();
    }, delay);
}

process.on("SIGINT", () => {
    log("Stopping bot...");

    manuallyClosing = true;

    stopLeaveRejoin();

    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
    }

    if (client) {
        try {
            client.close();
        } catch (err) {}
    }

    process.exit();
});

process.on("uncaughtException", (err) => {
    error(`Uncaught error: ${err.message}`);
});

startBot();
