const settings = require("./settings.json");

let leaveTimer = null;

function startLeaveRejoin(client, reconnectBot) {

    // Agar feature settings mein off hai
    if (!settings.leaveRejoin) {
        console.log("[LEAVE/REJOIN] Feature disabled.");
        return;
    }

    const minutes = settings.leaveAfterMinutes || 30;
    const rejoinSeconds = settings.rejoinAfterSeconds || 10;

    console.log(
        `[LEAVE/REJOIN] Bot ${minutes} minutes baad reconnect hoga.`
    );

    leaveTimer = setTimeout(() => {

        console.log("[LEAVE/REJOIN] Bot disconnect ho raha hai...");

        try {
            if (client) {
                client.close();
            }
        } catch (error) {
            console.log("[LEAVE/REJOIN] Close error:", error.message);
        }

        console.log(
            `[LEAVE/REJOIN] ${rejoinSeconds} seconds baad dobara connect hoga.`
        );

        setTimeout(() => {

            reconnectBot();

        }, rejoinSeconds * 1000);

    }, minutes * 60 * 1000);
}


function stopLeaveRejoin() {

    if (leaveTimer) {

        clearTimeout(leaveTimer);

        leaveTimer = null;

        console.log("[LEAVE/REJOIN] Timer stopped.");
    }
}


module.exports = {
    startLeaveRejoin,
    stopLeaveRejoin
};
