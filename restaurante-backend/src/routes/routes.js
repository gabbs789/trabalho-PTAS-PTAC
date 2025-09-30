const express = require('express');
const router = express.Router();


const userController = require('../controllers/authController');
const authMiddleware = require('../middleware/middleware');

router.post('/auth/cadastro', userController.register);
router.post('/auth/login', userController.login);

router.get('/auth/profile', authMiddleware, userController.profile);
router.put('/auth/profile', authMiddleware, userController.updateProfile);

module.exports = router;
