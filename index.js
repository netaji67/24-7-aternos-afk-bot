const bedrock = require("bedrock-protocol");
const config = require("./config.json");

let client = null;
let reconnectTimer = null;
let jumpTimer = null;
let leaveTimer = null;

let connected = false;

function log(message) {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
}

function connectBot() {

    log(`Connecting to ${config.host}:${config.port}...`);

    try {

        client = bedrock.createClient({
            host: config.host,
            port: config.port,
            username: config.username,
            offline: true
        });

        client.on("join", () => {

            connected = true;

            log("Bot joined the server!");

            startAFK();

            startLeaveRejoin();
        });

        client.on("disconnect", (packet) => {

            connected = false;

            log("Disconnected from server.");

            stopTimers();

            reconnect();
        });

        client.on("error", (error) => {

            log(`Error: ${error.message}`);
        });

        client.on("text", (packet) => {

            if (!packet.message) return;

            log(`[CHAT] ${packet.message}`);
        });

    } catch (error) {

        log(`Connection error: ${error.message}`);

        reconnect();
    }
}


function reconnect() {

    if (!config.reconnect) return;

    if (reconnectTimer) return;

    log(`Reconnecting in ${config.reconnectDelay / 1000} seconds...`);

    reconnectTimer = setTimeout(() => {

        reconnectTimer = null;

        connectBot();

    }, config.reconnectDelay);
}


function startAFK() {

    if (!config.afk) return;

    stopAFK();

    log("AFK mode started.");

    jumpTimer = setInterval(() => {

        if (!connected || !client) return;

        try {

            client.queue("player_auth_input", {
                pitch: 0,
                yaw: 0,
                position: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                move_vector: {
                    x: 0,
                    z: 0
                },
                head_yaw: 0,
                input_data: {
                    type: "bitset",
                    value: ["jumping"]
                },
                input_mode: 2,
                play_mode: 0,
                interaction_model: 0,
                tick: BigInt(Date.now())
            });

            log("AFK jump.");

        } catch (error) {

            log(`AFK error: ${error.message}`);
        }

    }, config.jumpInterval);
}


function stopAFK() {

    if (jumpTimer) {

        clearInterval(jumpTimer);

        jumpTimer = null;
    }
}


function startLeaveRejoin() {

    if (!config.leaveRejoin) return;

    if (leaveTimer) return;

    const time = config.leaveAfterMinutes * 60 * 1000;

    log(`Leave/rejoin scheduled in ${config.leaveAfterMinutes} minutes.`);

    leaveTimer = setTimeout(() => {

        log("Leaving server for scheduled reconnect...");

        stopTimers();

        if (client) {

            try {
                client.close();
            } catch (error) {}
        }

        setTimeout(() => {

            connectBot();

        }, config.rejoinAfterSeconds * 1000);

    }, time);
}


function stopTimers() {

    stopAFK();

    if (leaveTimer) {

        clearTimeout(leaveTimer);

        leaveTimer = null;
    }
}


process.on("SIGINT", () => {

    log("Stopping bot...");

    stopTimers();

    if (client) {

        try {
            client.close();
        } catch (error) {}
    }

    process.exit();
});


process.on("uncaughtException", (error) => {

    log(`Uncaught error: ${error.message}`);
});


connectBot();
