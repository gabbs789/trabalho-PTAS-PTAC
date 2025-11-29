const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/mesasController');
const auth = require('../middleware/middleware');

router.post('/novo', auth, ctrl.criar);
router.get('/', ctrl.listar);
router.get('/disponibilidade', ctrl.disponibilidade);

module.exports = router;
