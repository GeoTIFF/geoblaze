const debug_level = require('./env').debug_level;

module.exports = {
    log(statement) {
        if (debug_level >= 1) {
            console.log(statement);
        }
    },

    error(statement) {
        if (debug_level >= 2) {
            console.error(statement);
        }
    }
}