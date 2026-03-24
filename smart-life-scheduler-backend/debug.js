const { spawn } = require('child_process');
const fs = require('fs');

const out = fs.openSync('./out.txt', 'a');
const err = fs.openSync('./err.txt', 'a');

const child = spawn('node', ['server.js'], {
  detached: true,
  stdio: ['ignore', out, err]
});

child.unref();
console.log('Started server with PID:', child.pid);
