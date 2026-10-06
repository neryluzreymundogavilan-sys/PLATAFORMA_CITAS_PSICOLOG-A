const db = require('../config/db');
const bcrypt = require('bcrypt');

// Mock in-memory storage fallback si la BD no estuviera ejecutándose localmente
let alumnosMemory = [
  { id_alumno: 1, codigo_estudiantil: 'APSTI-2024-001', dni: '73456128', nombres: 'Katty Maribel', apellidos: 'Huaman Acho', carrera_profesional: 'Arquitectura de Plataformas TI', semestre_academico: 'IV Semestre', telefono: '967890123' },
  { id_alumno: 2, codigo_estudiantil: 'APSTI-2024-002', dni: '74125896', nombres: 'Nery Luz', apellidos: 'Reymundo Gavilan', carrera_profesional: 'Arquitectura de Plataformas TI', semestre_academico: 'IV Semestre', telefono: '954123987' },
  { id_alumno: 3, codigo_estudiantil: 'ENF-2024-012', dni: '76891234', nombres: 'Carmen Rosa', apellidos: 'Flores Taipe', carrera_profesional: 'Enfermería Técnica', semestre_academico: 'II Semestre', telefono: '932145698' }
];

// 1. Listar Alumnos con Filtros de Búsqueda
const listarAlumnos = async (req, res) => {
  try {
    const { busqueda, carrera } = req.query;
    let sql = 'SELECT * FROM alumnos WHERE 1=1';
    const params = [];

    if (busqueda) {
      sql += ' AND (dni LIKE ? OR nombres LIKE ? OR apellidos LIKE ? OR codigo_estudiantil LIKE ?)';
      const term = `%${busqueda}%`;
      params.push(term, term, term, term);
    }

    if (carrera && carrera !== 'Todas') {
      sql += ' AND carrera_profesional = ?';
      params.push(carrera);
    }

    sql += ' ORDER BY apellidos ASC';
    const [rows] = await db.query(sql, params);
    return res.json({ status: 'OK', total: rows.length, data: rows });
  } catch (error) {
    console.warn('Usando memoria para Alumnos:', error.message);
    return res.json({ status: 'OK', total: alumnosMemory.length, data: alumnosMemory });
  }
};

// 2. Obtener Alumno por ID
const obtenerAlumnoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM alumnos WHERE id_alumno = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'Error', message: 'Alumno no encontrado.' });
    }
    return res.json({ status: 'OK', data: rows[0] });
  } catch (error) {
    const alum = alumnosMemory.find(a => a.id_alumno == id);
    if (!alum) return res.status(404).json({ status: 'Error', message: 'Alumno no encontrado.' });
    return res.json({ status: 'OK', data: alum });
  }
};

// 3. Crear Nuevo Alumno (Validación de DNI y Código Único)
const crearAlumno = async (req, res) => {
  const { codigo_estudiantil, dni, nombres, apellidos, carrera_profesional, semestre_academico, sexo, fecha_nacimiento, telefono, direccion } = req.body;

  if (!codigo_estudiantil || !dni || !nombres || !apellidos || !carrera_profesional) {
    return res.status(400).json({ status: 'Error', message: 'Todos los campos obligatorios deben ser completados.' });
  }

  if (dni.length !== 8) {
    return res.status(400).json({ status: 'Error', message: 'El DNI debe contener exactamente 8 dígitos.' });
  }

  try {
    // Validar DNI duplicado
    const [existDni] = await db.query('SELECT id_alumno FROM alumnos WHERE dni = ? OR codigo_estudiantil = ?', [dni, codigo_estudiantil]);
    if (existDni.length > 0) {
      return res.status(400).json({ status: 'Error', message: 'El DNI o Código Estudiantil ya se encuentra registrado en el sistema.' });
    }

    // 1. Crear usuario en tabla usuarios
    const correoInst = `${nombres.toLowerCase().replace(/\s+/g, '')}.${apellidos.toLowerCase().split(' ')[0]}@scorza.edu.pe`;
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const [userRes] = await db.query(
      'INSERT INTO usuarios (correo_institucional, password_hash, id_rol, estado_cuenta) VALUES (?, ?, 3, "Activo")',
      [correoInst, passwordHash]
    );

    // 2. Crear registro en tabla alumnos
    const [alumRes] = await db.query(
      `INSERT INTO alumnos (id_usuario, codigo_estudiantil, dni, nombres, apellidos, carrera_profesional, semestre_academico, sexo, fecha_nacimiento, telefono, direccion) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userRes.insertId, codigo_estudiantil, dni, nombres, apellidos, carrera_profesional, semestre_academico || 'I Semestre', sexo || 'Femenino', fecha_nacimiento || '2003-01-01', telefono || '', direccion || 'Acobamba']
    );

    return res.status(201).json({
      status: 'OK',
      message: 'Alumno registrado exitosamente en la base de datos.',
      id_alumno: alumRes.insertId,
      correo_asignado: correoInst
    });

  } catch (error) {
    console.warn('Guardando alumno en memoria:', error.message);
    const nuevoId = alumnosMemory.length + 1;
    const nuevoAlum = { id_alumno: nuevoId, codigo_estudiantil, dni, nombres, apellidos, carrera_profesional, semestre_academico, telefono };
    alumnosMemory.push(nuevoAlum);
    return res.status(201).json({ status: 'OK', message: 'Alumno registrado con éxito (Memoria).', id_alumno: nuevoId, data: nuevoAlum });
  }
};

// 4. Actualizar Alumno
const actualizarAlumno = async (req, res) => {
  const { id } = req.params;
  const { nombres, apellidos, carrera_profesional, semestre_academico, telefono, direccion } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE alumnos SET nombres = ?, apellidos = ?, carrera_profesional = ?, semestre_academico = ?, telefono = ?, direccion = ? WHERE id_alumno = ?',
      [nombres, apellidos, carrera_profesional, semestre_academico, telefono, direccion, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'Error', message: 'Alumno no encontrado para actualizar.' });
    }

    return res.json({ status: 'OK', message: 'Información del alumno actualizada con éxito.' });
  } catch (error) {
    const idx = alumnosMemory.findIndex(a => a.id_alumno == id);
    if (idx !== -1) {
      alumnosMemory[idx] = { ...alumnosMemory[idx], nombres, apellidos, carrera_profesional, semestre_academico, telefono };
      return res.json({ status: 'OK', message: 'Alumno actualizado en memoria.' });
    }
    return res.status(404).json({ status: 'Error', message: 'Alumno no encontrado.' });
  }
};

// 5. Eliminar / Inactivar Alumno
const eliminarAlumno = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM alumnos WHERE id_alumno = ?', [id]);
    return res.json({ status: 'OK', message: 'Registro de alumno eliminado correctamente.' });
  } catch (error) {
    alumnosMemory = alumnosMemory.filter(a => a.id_alumno != id);
    return res.json({ status: 'OK', message: 'Alumno eliminado de la lista.' });
  }
};

module.exports = { listarAlumnos, obtenerAlumnoPorId, crearAlumno, actualizarAlumno, eliminarAlumno };
