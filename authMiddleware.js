const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ScorzaPsicologia2026SecretKeyJWT!#99';

// Middleware para verificar la validez del Token JWT en las peticiones
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ status: 'Error', message: 'Acceso denegado. No se proporcionó un token de autorización.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Adjunta datos del usuario autenticado (id_usuario, correo, rol)
    next();
  } catch (error) {
    return res.status(403).json({ status: 'Error', message: 'Token de sesión inválido o expirado.' });
  }
};

// Middleware para autorizar accesos según el rol de usuario (RBAC)
const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'Error', message: 'Usuario no autenticado.' });
    }

    const userRole = req.user.nombre_rol;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        status: 'Error',
        message: `Acceso restringido. El rol '${userRole}' no posee los permisos necesarios para realizar esta acción.`
      });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole };
