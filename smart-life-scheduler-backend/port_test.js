const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Echo: Port 5000 is open!\n');
});
server.listen(5000, '0.0.0.0', () => {
  console.log('Test server listening on port 5000');
});
