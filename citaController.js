const db = require('../config/db');

// Mock memory fallback
let citasMemory = [
  { id_cita: 1, codigo_cita: 'CIT-2026-0101', alumno: 'Katty Maribel Huaman Acho', carrera: 'Arquitectura de Plataformas TI', psicologo: 'Lic. José Gabriel Quispe', fecha_cita: '2026-09-15', hora_inicio: '09:00 AM', modalidad: 'Presencial', estado_cita: 'Atendida', motivo_consulta: 'Sobrecarga de trabajo por entregables finales' },
  { id_cita: 2, codigo_cita: 'CIT-2026-0102', alumno: 'Nery Luz Reymundo Gavilan', carrera: 'Arquitectura de Plataformas TI', psicologo: 'Lic. José Gabriel Quispe', fecha_cita: '2026-09-22', hora_inicio: '10:00 AM', modalidad: 'Presencial', estado_cita: 'Atendida', motivo_consulta: 'Ansiedad ante exámenes y gestión del tiempo' },
  { id_cita: 3, codigo_cita: 'CIT-2026-0103', alumno: 'Jhon Fernando Álvarez Boza', carrera: 'Arquitectura de Plataformas TI', psicologo: 'Dra. María Elena Romero', fecha_cita: '2026-09-29', hora_inicio: '11:00 AM', modalidad: 'Virtual', estado_cita: 'Confirmada', motivo_consulta: 'Orientación vocacional y plan de estudios' }
];

// 1. Listar Citas con Filtros por Rol o Estado
const listarCitas = async (req, res) => {
  try {
    const { estado, fecha } = req.query;
    let sql = `
      SELECT c.id_cita, c.codigo_cita, c.fecha_cita, c.hora_inicio, c.hora_fin, c.modalidad, c.motivo_consulta, c.estado_cita,
             CONCAT(a.nombres, ' ', a.apellidos) AS alumno, a.carrera_profesional AS carrera,
             CONCAT(p.nombres, ' ', p.apellidos) AS psicologo
      FROM citas c
      INNER JOIN alumnos a ON c.id_alumno = a.id_alumno
      INNER JOIN psicologos p ON c.id_psicologo = p.id_psicologo
      WHERE 1=1
    `;
    const params = [];

    if (estado) {
      sql += ' AND c.estado_cita = ?';
      params.push(estado);
    }

    if (fecha) {
      sql += ' AND c.fecha_cita = ?';
      params.push(fecha);
    }

    sql += ' ORDER BY c.fecha_cita DESC, c.hora_inicio ASC';
    const [rows] = await db.query(sql, params);
    return res.json({ status: 'OK', total: rows.length, data: rows });
  } catch (error) {
    console.warn('Usando memoria para Citas:', error.message);
    return res.json({ status: 'OK', total: citasMemory.length, data: citasMemory });
  }
};

// 2. Obtener Cita por ID
const obtenerCitaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM citas WHERE id_cita = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ status: 'Error', message: 'Cita no encontrada.' });
    return res.json({ status: 'OK', data: rows[0] });
  } catch (error) {
    const cita = citasMemory.find(c => c.id_cita == id);
    if (!cita) return res.status(404).json({ status: 'Error', message: 'Cita no encontrada.' });
    return res.json({ status: 'OK', data: cita });
  }
};

// 3. Crear Reserva de Cita Psicológica
const crearCita = async (req, res) => {
  const { id_alumno, id_psicologo, fecha_cita, hora_inicio, modalidad, motivo_consulta } = req.body;

  if (!fecha_cita || !hora_inicio || !motivo_consulta) {
    return res.status(400).json({ status: 'Error', message: 'Debe ingresar la fecha, hora y motivo de la consulta.' });
  }

  const numRandom = Math.floor(1000 + Math.random() * 9000);
  const codigoCita = `CIT-2026-${numRandom}`;

  try {
    // Validar cruce de horario en la misma fecha y psicologo
    const [exist] = await db.query(
      'SELECT id_cita FROM citas WHERE id_psicologo = ? AND fecha_cita = ? AND hora_inicio = ? AND estado_cita != "Cancelada"',
      [id_psicologo || 1, fecha_cita, hora_inicio]
    );

    if (exist.length > 0) {
      return res.status(400).json({ status: 'Error', message: 'El horario seleccionado ya se encuentra ocupado para este especialista.' });
    }

    const [result] = await db.query(
      `INSERT INTO citas (codigo_cita, id_alumno, id_psicologo, fecha_cita, hora_inicio, hora_fin, modalidad, motivo_consulta, estado_cita)
       VALUES (?, ?, ?, ?, ?, ADDTIME(?, '01:00:00'), ?, ?, 'Pendiente')`,
      [codigoCita, id_alumno || 1, id_psicologo || 1, fecha_cita, hora_inicio, hora_inicio, modalidad || 'Presencial', motivo_consulta]
    );

    return res.status(201).json({
      status: 'OK',
      message: 'Cita registrada con éxito en estado Pendiente.',
      id_cita: result.insertId,
      codigo_cita: codigoCita,
      fecha: fecha_cita,
      hora: hora_inicio
    });

  } catch (error) {
    console.warn('Creando cita en memoria:', error.message);
    const nuevaId = citasMemory.length + 1;
    const nuevaCita = {
      id_cita: nuevaId,
      codigo_cita: codigoCita,
      alumno: 'Katty Maribel Huaman Acho',
      carrera: 'Arquitectura de Plataformas TI',
      psicologo: 'Lic. José Gabriel Quispe',
      fecha_cita,
      hora_inicio,
      modalidad: modalidad || 'Presencial',
      estado_cita: 'Pendiente',
      motivo_consulta
    };
    citasMemory.unshift(nuevaCita);
    return res.status(201).json({ status: 'OK', message: 'Cita creada exitosamente (Memoria).', codigo_cita: codigoCita, data: nuevaCita });
  }
};

// 4. Actualizar Estado de Cita (Confirmada, Atendida, Cancelada)
const actualizarEstadoCita = async (req, res) => {
  const { id } = req.params;
  const { estado_cita, observaciones_cancelacion } = req.body;

  const estadosValidos = ['Pendiente', 'Confirmada', 'Atendida', 'Cancelada', 'No Asistió'];
  if (!estadosValidos.includes(estado_cita)) {
    return res.status(400).json({ status: 'Error', message: 'Estado de cita no válido.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE citas SET estado_cita = ?, observaciones_cancelacion = ? WHERE id_cita = ?',
      [estado_cita, observaciones_cancelacion || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'Error', message: 'Cita no encontrada.' });
    }

    return res.json({ status: 'OK', message: `Estado de cita actualizado a '${estado_cita}'.` });
  } catch (error) {
    const cita = citasMemory.find(c => c.id_cita == id);
    if (cita) {
      cita.estado_cita = estado_cita;
      return res.json({ status: 'OK', message: `Estado de cita actualizado a '${estado_cita}' en memoria.` });
    }
    return res.status(404).json({ status: 'Error', message: 'Cita no encontrada.' });
  }
};

// 5. Eliminar Cita
const eliminarCita = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM citas WHERE id_cita = ?', [id]);
    return res.json({ status: 'OK', message: 'Cita eliminada correctamente del registro.' });
  } catch (error) {
    citasMemory = citasMemory.filter(c => c.id_cita != id);
    return res.json({ status: 'OK', message: 'Cita eliminada de la lista.' });
  }
};

module.exports = { listarCitas, obtenerCitaPorId, crearCita, actualizarEstadoCita, eliminarCita };
