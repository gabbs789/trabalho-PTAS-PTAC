
const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes'); 
const mesasRouter = require('./routes/mesas');
const reservasRouter = require('./routes/reservas');

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/', (req, res) =>
  res.json({
    status: 'ok',
    endpoints: [
      { method: 'POST', path: '/cadastro' },
      { method: 'POST', path: '/login' },
      { method: 'POST', path: '/auth/cadastro' },
      { method: 'POST', path: '/auth/login' },
      { method: 'GET', path: '/health' }
    ]
  })
);

 
app.use(routes);
app.use('/auth', routes);


app.use('/mesas', mesasRouter);

app.use('/reservas', reservasRouter);

module.exports = app;
