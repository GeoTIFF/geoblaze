const debugLevel = require('./env').debugLevel;

// the debugger takes multiple statements for strings in order
// to emulate the console object functions. However, it can also
// run a function for greater flexibility. In this case, only the
// first statement is run

function runOrLogStatements(format, ...statements) {
  const firstStatement = statements[0];
  if (typeof firstStatement === 'function') {
    firstStatement();
  } else {
    console[format](statements);
  }
}

module.exports = {

  debug(...statements) {
    if (debugLevel >= 2) {
      runOrLogStatements('log', ...statements);
    }
  },

  info(...statements) {
    if (debugLevel) {
      runOrLogStatements('log', ...statements);
    }
  },

  error(...statements) {
    if (debugLevel) {
      runOrLogStatements('error', ...statements);
    }
  }
}
