const debug_level = require('./env').debug_level;

// the debugger takes multiple statements for strings in order
// to emulate the console object functions. However, it can also
// run a function for greater flexibility. In this case, only the
// first statement is run

function run_or_log_statements(format, ...statements) {
    const first_statement = statements[0];
    if (typeof first_statement === 'function') {
        first_statement();
    } else {
        console[format](statements);
    }
}

module.exports = {

    debug(...statements) {
        if (debug_level >= 2) {
            run_or_log_statements('log', ...statements);
        }
    },

    info(...statements) {
        if (debug_level) {
            run_or_log_statements('log', ...statements);
        }
    },

    error(...statements) {
        if (debug_level) {
            run_or_log_statements('error', ...statements);
        }
    }
}
