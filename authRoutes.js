const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Endpoint de inicio de sesión
router.post('/login', authController.login);

// Endpoint de cierre de sesión
router.post('/logout', authController.logout);

// Endpoint para obtener información del usuario logueado (Ruta protegida)
router.get('/me', verifyToken, authController.me);

module.exports = router;
