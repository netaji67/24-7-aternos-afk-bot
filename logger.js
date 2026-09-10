function log(message) {
    const time = new Date().toLocaleString();

    console.log(`[${time}] ${message}`);
}

function error(message) {
    const time = new Date().toLocaleString();

    console.error(`[${time}] ERROR: ${message}`);
}

module.exports = {
    log,
    error
};
