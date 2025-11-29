const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reservasController');
const auth = require('../middleware/middleware');

// Criar reserva (login)
router.post('/novo', auth, ctrl.criar);

// Retornar apenas minhas reservas (login)
router.post('/', auth, ctrl.minhas);

// Deletar reserva (dono)
router.delete('/', auth, ctrl.deletar);

// Listar reservas por data (admin)
router.get('/list', auth, ctrl.listarPorData);

module.exports = router;
