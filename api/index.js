const { createServer } = require('@vendia/serverless-express');
const app = require('../server/src/index.js');

const server = createServer(app);

module.exports = (req, res) => {
  return server(req, res);
};