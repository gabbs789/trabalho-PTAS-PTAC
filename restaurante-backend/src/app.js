
const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes'); 

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoints auxiliares para facilitar testes no Thunder Client
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

// Disponibiliza as rotas também na raiz para facilitar uso no Thunder Client
app.use(routes);
app.use('/auth', routes);


module.exports = app;
