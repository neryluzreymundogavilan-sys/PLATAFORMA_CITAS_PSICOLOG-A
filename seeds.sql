-- ============================================================================
-- PROYECTO INTEGRADOR: PLATAFORMA WEB DE GESTIÓN DE CITAS Y ATENCIÓN AL ALUMNO
-- CONSULTORIO DE PSICOLOGÍA - IESTP MANUEL SCORZA TORRE (ACOBAMBA, HUANCAVELICA)
-- SCRIPT DE DATOS SEMILLA / DML (seeds.sql)
-- ============================================================================

USE bd_psicologia_scorza;

-- ----------------------------------------------------------------------------
-- 1. REGISTRO DE ROLES
-- ----------------------------------------------------------------------------
INSERT INTO roles (id_rol, nombre_rol, descripcion) VALUES
(1, 'Administrador', 'Acceso total al sistema, gestión de usuarios y reportes generales'),
(2, 'Psicólogo', 'Gestión de agenda, atención de citas y actualización de Historias Clínicas'),
(3, 'Alumno', 'Reserva de citas, consulta de horarios y estado de atenciones');

-- ----------------------------------------------------------------------------
-- 2. REGISTRO DE ESPECIALIDADES PSICOLÓGICAS
-- ----------------------------------------------------------------------------
INSERT INTO especialidades (id_especialidad, nombre_especialidad, descripcion) VALUES
(1, 'Psicología Educativa y Psicopedagogía', 'Atención a problemas de aprendizaje, rendimiento académico y hábitos de estudio'),
(2, 'Orientación Vocacional y Profesional', 'Asesoría en plan de vida, adaptación a la educación superior y desarrollo profesional'),
(3, 'Psicología Clínica y Emocional', 'Atención del estrés académico, ansiedad, depresión y regulación emocional'),
(4, 'Intervención en Crisis y Apoyo Social', 'Atención prioritaria para situaciones de vulnerabilidad, luto o eventos traumáticos');

-- ----------------------------------------------------------------------------
-- 3. REGISTRO DE USUARIOS
-- Contraseñas encriptadas ficticias (bcrypt hash para 'Password123!')
-- ----------------------------------------------------------------------------
INSERT INTO usuarios (id_usuario, correo_institucional, password_hash, id_rol, estado_cuenta) VALUES
-- Administrador
(1, 'admin.psicologia@scorza.edu.pe', '$2b$10$wT.M4N/bT...hashedpassword123admin', 1, 'Activo'),
-- Psicólogos
(2, 'jquispe@scorza.edu.pe', '$2b$10$wT.M4N/bT...hashedpassword123psico1', 2, 'Activo'),
(3, 'mromero@scorza.edu.pe', '$2b$10$wT.M4N/bT...hashedpassword123psico2', 2, 'Activo'),
(4, 'kvilchez@scorza.edu.pe', '$2b$10$wT.M4N/bT...hashedpassword123psico3', 2, 'Activo'),
-- Alumnos (Estudiantes IESTP Manuel Scorza Torre - Acobamba)
(5, 'katty.huaman@scorza.edu.pe', '$2b$10$wT.M4N/bT...hashedpassword123alum1', 3, 'Activo'),
(6, 'nery.solano@scorza.edu.pe', '$2b$10$wT.M4N/bT...hashedpassword123alum2', 3, 'Activo'),
(7, 'jhon.alvarez@scorza.edu.pe', '$2b$10$wT.M4N/bT...hashedpassword123alum3', 3, 'Activo'),
(8, 'carmen.flores@scorza.edu.pe', '$2b$10$wT.M4N/bT...hashedpassword123alum4', 3, 'Activo'),
(9, 'luis.mendoza@scorza.edu.pe', '$2b$10$wT.M4N/bT...hashedpassword123alum5', 3, 'Activo'),
(10, 'ana.palomino@scorza.edu.pe', '$2b$10$wT.M4N/bT...hashedpassword123alum6', 3, 'Activo');

-- ----------------------------------------------------------------------------
-- 4. REGISTRO DE PSICÓLOGOS
-- ----------------------------------------------------------------------------
INSERT INTO psicologos (id_psicologo, id_usuario, id_especialidad, dni, nombres, apellidos, colegiatura_cpsp, telefono, consultorio_asignado) VALUES
(1, 2, 1, '45892134', 'José Gabriel', 'Quispe Anyaipoma', 'CPSP-28415', '967123456', 'Consultorio 01 - Pabellón A'),
(2, 3, 3, '41238901', 'María Elena', 'Romero Ccanto', 'CPSP-31042', '954781203', 'Consultorio 02 - Pabellón A'),
(3, 4, 2, '48901245', 'Karin Lisbeth', 'Vílchez Torrealva', 'CPSP-34190', '981234789', 'Consultorio 03 - Pabellón B');

-- ----------------------------------------------------------------------------
-- 5. REGISTRO DE ALUMNOS
-- Carrera: Arquitectura de Plataformas y Servicios de Tecnologías de Información
-- ----------------------------------------------------------------------------
INSERT INTO alumnos (id_alumno, id_usuario, codigo_estudiantil, dni, nombres, apellidos, carrera_profesional, semestre_academico, sexo, fecha_nacimiento, telefono, direccion, contacto_emergencia, telefono_emergencia) VALUES
(1, 5, 'APSTI-2024-001', '73456128', 'Katty Maribel', 'Huaman Acho', 'Arquitectura de Plataformas y Servicios de TI', 'IV Semestre', 'Femenino', '2003-05-14', '967890123', 'Jr. Grau N° 245, Acobamba', 'Sra. Juana Acho (Madre)', '967000111'),
(2, 6, 'APSTI-2024-002', '74125896', 'Nery Jhon', 'Solano Ccora', 'Arquitectura de Plataformas y Servicios de TI', 'IV Semestre', 'Masculino', '2002-11-20', '954123987', 'Av. Bolognesi N° 110, Acobamba', 'Sr. Jhon Solano (Padre)', '954000222'),
(3, 7, 'APSTI-2024-003', '75984123', 'Jhon Fernando', 'Álvarez Boza', 'Arquitectura de Plataformas y Servicios de TI', 'IV Semestre', 'Masculino', '2003-02-08', '981456123', 'Barrio Santos, Acobamba', 'Sra. Rosa Boza', '981000333'),
(4, 8, 'ENF-2024-012', '76891234', 'Carmen Rosa', 'Flores Taipe', 'Enfermería Técnica', 'II Semestre', 'Femenino', '2004-08-30', '932145698', 'Jr. Lima N° 450, Acobamba', 'Sra. Elena Taipe', '932000444'),
(5, 9, 'MEC-2024-005', '72145890', 'Luis Miguel', 'Mendoza Quispe', 'Mecánica Automotriz', 'VI Semestre', 'Masculino', '2001-04-12', '921789456', 'Av. Centenario N° 820, Acobamba', 'Sr. Carlos Mendoza', '921000555'),
(6, 10, 'APSTI-2024-010', '78912345', 'Ana Lucía', 'Palomino Matos', 'Arquitectura de Plataformas y Servicios de TI', 'IV Semestre', 'Femenino', '2003-09-18', '945123678', 'Jr. Sucre N° 130, Acobamba', 'Sra. Marta Matos', '945000666');

-- ----------------------------------------------------------------------------
-- 6. REGISTRO DE DISPONIBILIDAD HORARIA
-- ----------------------------------------------------------------------------
INSERT INTO disponibilidad_horaria (id_disponibilidad, id_psicologo, dia_semana, hora_inicio, hora_fin, turno, estado) VALUES
(1, 1, 'Lunes', '08:00:00', '13:00:00', 'Mañana', TRUE),
(2, 1, 'Miércoles', '08:00:00', '13:00:00', 'Mañana', TRUE),
(3, 1, 'Viernes', '14:00:00', '18:00:00', 'Tarde', TRUE),
(4, 2, 'Martes', '08:00:00', '13:00:00', 'Mañana', TRUE),
(5, 2, 'Jueves', '14:00:00', '18:00:00', 'Tarde', TRUE),
(6, 3, 'Lunes', '14:00:00', '18:00:00', 'Tarde', TRUE),
(7, 3, 'Miércoles', '14:00:00', '18:00:00', 'Tarde', TRUE);

-- ----------------------------------------------------------------------------
-- 7. REGISTRO DE HISTORIAS CLÍNICAS
-- ----------------------------------------------------------------------------
INSERT INTO historias_clinicas (id_historia, numero_expediente, id_alumno, fecha_apertura, antecedentes_personales, antecedentes_familiares, observaciones_generales, estado_expediente) VALUES
(1, 'HC-2026-0001', 1, '2026-09-10', 'Sin antecedentes psicológicos previos reportados.', 'Familia nuclear estable, reside en Acobamba.', 'Estudiante con alto desempeño académico, consulta por sobrecarga emocional.', 'En Seguimiento'),
(2, 'HC-2026-0002', 2, '2026-09-12', 'Episodios leves de ansiedad durante exámenes finales.', 'Antecedentes de migraña materna.', 'Manifiesta estrés por entrega de proyectos integradores.', 'En Seguimiento'),
(3, 'HC-2026-0003', 3, '2026-09-15', 'Reporta dificultad en concentración y manejo del tiempo.', 'Padres comerciantes en Huancavelica.', 'Requiere orientación psicopedagógica en técnicas de estudio.', 'Abierto'),
(4, 'HC-2026-0004', 4, '2026-09-18', 'Sin antecedentes relevantes.', 'Buena dinámica familiar.', 'Consulta vocacional de reforzamiento.', 'Abierto'),
(5, 'HC-2026-0005', 5, '2026-09-20', 'Inquietud por adaptación a prácticas preprofesionales.', 'Familia radicada en Huanta.', 'Muestra motivación en la consulta.', 'Abierto');

-- ----------------------------------------------------------------------------
-- 8. REGISTRO DE CITAS
-- ----------------------------------------------------------------------------
INSERT INTO citas (id_cita, codigo_cita, id_alumno, id_psicologo, fecha_cita, hora_inicio, hora_fin, modalidad, motivo_consulta, estado_cita) VALUES
(1, 'CIT-2026-0101', 1, 1, '2026-09-15', '09:00:00', '10:00:00', 'Presencial', 'Estrés y sobrecarga por evaluación de proyectos integradores', 'Atendida'),
(2, 'CIT-2026-0102', 2, 1, '2026-09-22', '10:00:00', '11:00:00', 'Presencial', 'Ansiedad ante exámenes y gestión del tiempo', 'Atendida'),
(3, 'CIT-2026-0103', 3, 2, '2026-09-29', '09:00:00', '10:00:00', 'Presencial', 'Orientación en técnicas de memoria y concentración', 'Confirmada'),
(4, 'CIT-2026-0104', 4, 3, '2026-09-30', '15:00:00', '16:00:00', 'Virtual', 'Consulta sobre adaptación institucional y habilidades sociales', 'Pendiente'),
(5, 'CIT-2026-0105', 5, 2, '2026-10-01', '10:00:00', '11:00:00', 'Presencial', 'Orientación vocacional y preparación laboral', 'Pendiente'),
(6, 'CIT-2026-0106', 6, 1, '2026-10-02', '11:00:00', '12:00:00', 'Presencial', 'Evaluación de hábito de estudio y planificación semanal', 'Pendiente');

-- ----------------------------------------------------------------------------
-- 9. REGISTRO DE SESIONES DE ATENCIÓN PSICOLÓGICA
-- ----------------------------------------------------------------------------
INSERT INTO sesiones_atencion (id_sesion, id_historia, id_cita, id_psicologo, fecha_atencion, numero_sesion, diagnostico_presuntivo, evaluacion_psicologica, plan_intervencion, recomendaciones, proxima_cita_sugerida) VALUES
(1, 1, 1, 1, '2026-09-15 09:15:00', 1, 'Reacción al estrés agudo por carga académica elevada (F43.0)', 'Paciente orientada, colaboradora, manifiesta tensión muscular y preocupación constante por entregables.', 'Entrenamiento en respiración diafragmática y matriz de priorización Eisenhower.', 'Establecer horarios fijos de descanso nocturno y pausas activas durante el estudio.', '2026-10-06'),
(2, 2, 2, 1, '2026-09-22 10:10:00', 1, 'Ansiedad de ejecución académica (F41.9)', 'Paciente consciente de sus pensamientos limitantes frente a evaluaciones.', 'Técnica de reestructuración cognitiva y registro de pensamientos automáticos.', 'Practicar simulación de exposiciones en casa y técnica Pomodoro.', '2026-10-13');
