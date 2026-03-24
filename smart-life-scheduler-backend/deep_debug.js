const fs = require('fs');

process.on('uncaughtException', (err) => {
  fs.writeFileSync('deep_crash.txt', 'UNCAUGHT EXCEPTION: \n' + err.stack);
  console.error("FATAL ERROR CAUGHT:", err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
  fs.writeFileSync('deep_crash.txt', 'UNHANDLED REJECTION: \n' + (reason ? reason.stack || reason : 'Unknown Reject'));
  console.error("FATAL REJECTION CAUGHT:", reason);
  process.exit(1);
});

try {
  console.log("Loading server.js...");
  require('./server.js');
  
  // Keep alive for 5 seconds to catch delayed async crashes like DB timeouts
  setTimeout(() => {
    if (!fs.existsSync('deep_crash.txt')) {
      fs.writeFileSync('deep_crash.txt', 'SERVER STAYED ALIVE FOR 5 SECONDS WITHOUT CRASHING.');
    }
  }, 5000);
} catch (e) {
  fs.writeFileSync('deep_crash.txt', 'SYNC REQUIRE CRASH: \n' + e.stack);
}
