const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reservasController');
const auth = require('../middleware/middleware');


router.post('/novo', auth, ctrl.criar);


router.post('/', auth, ctrl.minhas);


router.delete('/', auth, ctrl.deletar);


router.get('/list', auth, ctrl.listarPorData);

module.exports = router;
