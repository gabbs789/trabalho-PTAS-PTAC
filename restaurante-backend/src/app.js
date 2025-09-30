require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);

module.exports = app;
