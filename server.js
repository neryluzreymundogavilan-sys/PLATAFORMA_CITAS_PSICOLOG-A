const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const alumnoRoutes = require('./routes/alumnoRoutes');
const citaRoutes = require('./routes/citaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Registro de Rutas API REST
app.use('/api/auth', authRoutes);
app.use('/api/alumnos', alumnoRoutes);
app.use('/api/citas', citaRoutes);

// Endpoint de diagnóstico y salud del servidor
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API REST del Consultorio Psicológico - IESTP Manuel Scorza Torre activa.',
    version: '1.0.0 (Semana 3)',
    timestamp: new Date()
  });
});

// Redirección por defecto al frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Iniciar servidor Node.js
app.listen(PORT, () => {
  console.log(`====================================================================`);
  console.log(`[OK] Servidor escuchando en: http://localhost:${PORT}`);
  console.log(`[OK] API REST activa en: http://localhost:${PORT}/api/health`);
  console.log(`====================================================================`);
});
