const { createServer } = require('@vendia/serverless-express');

// Add error handling for missing dependencies
try {
  const app = require('../server/src/index.js');
  const server = createServer(app);

  module.exports = (req, res) => {
    try {
      return server(req, res);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
} catch (error) {
  console.error('Failed to load server:', error);
  module.exports = (req, res) => {
    res.status(500).json({ error: 'Server initialization failed' });
  };
}