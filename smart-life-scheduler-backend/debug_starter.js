const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'backend_debug.log');
const out = fs.openSync(logFile, 'a');
const err = fs.openSync(logFile, 'a');

console.log(`Starting server, logging to ${logFile}`);

const subprocess = spawn('node', ['server.js'], {
  cwd: __dirname,
  detached: true,
  stdio: ['ignore', out, err]
});

subprocess.unref();
process.exit(0);
