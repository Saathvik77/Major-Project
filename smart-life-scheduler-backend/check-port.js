const net = require('net');
const port = 5000;

const server = net.createServer();

server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${port} is in use`);
  } else {
    console.log(`Error: ${err.message}`);
  }
  process.exit(0);
});

server.once('listening', () => {
  console.log(`Port ${port} is free`);
  server.close();
  process.exit(0);
});

server.listen(port);
