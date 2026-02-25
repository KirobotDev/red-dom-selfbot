let sharedDbConfig = {};

function setDbConfig(config) {
    sharedDbConfig = config;
}

function getDbConfig() {
    return sharedDbConfig;
}

module.exports = { setDbConfig, getDbConfig };