const express = require('express');
const routes = require('./routes/routes');

const app = express();
app.use(express.json());
app.use('/auth', routes);

module.exports = app;
