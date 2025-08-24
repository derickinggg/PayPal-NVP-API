const serverlessExpress = require('@vendia/serverless-express');
const app = require('../src/index');

module.exports = (req, res) => {
	const handler = serverlessExpress({ app });
	return handler(req, res);
};