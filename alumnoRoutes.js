const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumnoController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Rutas protegidas para Alumnos (CRUD 1)
router.get('/', verifyToken, alumnoController.listarAlumnos);
router.get('/:id', verifyToken, alumnoController.obtenerAlumnoPorId);
router.post('/', verifyToken, checkRole(['Administrador', 'Psicólogo']), alumnoController.crearAlumno);
router.put('/:id', verifyToken, checkRole(['Administrador', 'Psicólogo']), alumnoController.actualizarAlumno);
router.delete('/:id', verifyToken, checkRole(['Administrador']), alumnoController.eliminarAlumno);

module.exports = router;
