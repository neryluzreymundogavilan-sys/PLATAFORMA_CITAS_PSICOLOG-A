const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Rutas protegidas para Citas Psicológicas (CRUD 2)
router.get('/', verifyToken, citaController.listarCitas);
router.get('/:id', verifyToken, citaController.obtenerCitaPorId);
router.post('/', verifyToken, citaController.crearCita); // Alumnos, Psicólogos o Admin pueden reservar cita
router.put('/:id/estado', verifyToken, checkRole(['Administrador', 'Psicólogo']), citaController.actualizarEstadoCita);
router.delete('/:id', verifyToken, checkRole(['Administrador', 'Psicólogo']), citaController.eliminarCita);

module.exports = router;
