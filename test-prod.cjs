const express = require('express');
const app = express();
app.get('/api/health', (req, res) => res.json({status: 'ok'}));
const server = app.listen(3000, '0.0.0.0', () => {
  console.log('Test server running');
  server.close();
});
