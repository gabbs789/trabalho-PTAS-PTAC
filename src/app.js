const express = require('express');
const routes = require('./routes/routes'); // ajuste se seu arquivo de rotas tem outro nome ou caminho

const app = express();
app.use(express.json());
app.use(routes);

module.exports = app;
