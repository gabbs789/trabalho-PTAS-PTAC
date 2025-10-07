const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

router.post('/cadastro', controller.cadastrar);
router.post('/login', controller.login);

module.exports = router;
