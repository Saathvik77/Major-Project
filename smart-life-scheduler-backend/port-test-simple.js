const express = require('express');
const app = express();
const PORT = 5000;

app.get('/', (req, res) => res.send('OK'));

app.listen(PORT, () => {
  console.log(`Test server listening on port ${PORT}`);
  process.exit(0);
});
