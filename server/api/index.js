const serverlessExpress = require('@vendia/serverless-express');
const app = require('../src/index');

const handler = serverlessExpress({ app });

module.exports = handler;