-- ============================================================================
-- PROYECTO INTEGRADOR: PLATAFORMA WEB DE GESTIÓN DE CITAS Y ATENCIÓN AL ALUMNO
-- CONSULTORIO DE PSICOLOGÍA - IESTP MANUEL SCORZA TORRE (ACOBAMBA, HUANCAVELICA)
-- SCRIPT DE CREACIÓN DE BASE DE DATOS (schema.sql)
-- SGDB: MySQL 8.0 / MariaDB 10.4+
-- Normalización: Tercera Forma Normal (3FN)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS bd_psicologia_scorza CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bd_psicologia_scorza;

-- Desactivar temporalmente revisión de claves foráneas para limpieza
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS sesiones_atencion;
DROP TABLE IF EXISTS historias_clinicas;
DROP TABLE IF EXISTS citas;
DROP TABLE IF EXISTS disponibilidad_horaria;
DROP TABLE IF EXISTS especialidades;
DROP TABLE IF EXISTS psicologos;
DROP TABLE IF EXISTS alumnos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- Tabla 1: ROLES
-- Definición de roles del sistema (Administrador, Psicólogo, Alumno)
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabla 2: USUARIOS
-- Cuentas de acceso con correo institucional y contraseña encriptada
-- ----------------------------------------------------------------------------
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    correo_institucional VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    estado_cuenta ENUM('Activo', 'Inactivo', 'Bloqueado') NOT NULL DEFAULT 'Activo',
    ultimo_acceso DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_roles FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabla 3: ALUMNOS
-- Perfil del estudiante asistido en el consultorio psicológico
-- ----------------------------------------------------------------------------
CREATE TABLE alumnos (
    id_alumno INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    codigo_estudiantil VARCHAR(20) NOT NULL UNIQUE,
    dni CHAR(8) NOT NULL UNIQUE,
    nombres VARCHAR(80) NOT NULL,
    apellidos VARCHAR(80) NOT NULL,
    carrera_profesional VARCHAR(100) NOT NULL,
    semestre_academico VARCHAR(10) NOT NULL,
    sexo ENUM('Masculino', 'Femenino', 'Otro') NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(15) NULL,
    direccion VARCHAR(200) NULL,
    contacto_emergencia VARCHAR(100) NULL,
    telefono_emergencia VARCHAR(15) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alumnos_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabla 4: ESPECIALIDADES
-- Áreas de atención psicológica (Psicopedagogía, Orientación Vocacional, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE especialidades (
    id_especialidad INT AUTO_INCREMENT PRIMARY KEY,
    nombre_especialidad VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabla 5: PSICOLOGOS
-- Información profesional de los especialistas a cargo de la atención
-- ----------------------------------------------------------------------------
CREATE TABLE psicologos (
    id_psicologo INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    id_especialidad INT NOT NULL,
    dni CHAR(8) NOT NULL UNIQUE,
    nombres VARCHAR(80) NOT NULL,
    apellidos VARCHAR(80) NOT NULL,
    colegiatura_cpsp VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(15) NULL,
    consultorio_asignado VARCHAR(50) DEFAULT 'Consultorio 01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_psicologos_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_psicologos_especialidades FOREIGN KEY (id_especialidad) REFERENCES especialidades(id_especialidad) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabla 6: DISPONIBILIDAD_HORARIA
-- Horarios programados de los psicólogos por día y turno
-- ----------------------------------------------------------------------------
CREATE TABLE disponibilidad_horaria (
    id_disponibilidad INT AUTO_INCREMENT PRIMARY KEY,
    id_psicologo INT NOT NULL,
    dia_semana ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    turno ENUM('Mañana', 'Tarde') NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_disponibilidad_psicologos FOREIGN KEY (id_psicologo) REFERENCES psicologos(id_psicologo) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabla 7: CITAS
-- Programación y seguimiento del estado de las citas reservadas
-- ----------------------------------------------------------------------------
CREATE TABLE citas (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    codigo_cita VARCHAR(15) NOT NULL UNIQUE,
    id_alumno INT NOT NULL,
    id_psicologo INT NOT NULL,
    fecha_cita DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    modalidad ENUM('Presencial', 'Virtual') NOT NULL DEFAULT 'Presencial',
    motivo_consulta VARCHAR(255) NOT NULL,
    estado_cita ENUM('Pendiente', 'Confirmada', 'Atendida', 'Cancelada', 'No Asistió') NOT NULL DEFAULT 'Pendiente',
    observaciones_cancelacion VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_citas_alumnos FOREIGN KEY (id_alumno) REFERENCES alumnos(id_alumno) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_citas_psicologos FOREIGN KEY (id_psicologo) REFERENCES psicologos(id_psicologo) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabla 8: HISTORIAS_CLINICAS
-- Expediente psicológico único e confidencial por alumno
-- ----------------------------------------------------------------------------
CREATE TABLE historias_clinicas (
    id_historia INT AUTO_INCREMENT PRIMARY KEY,
    numero_expediente VARCHAR(20) NOT NULL UNIQUE,
    id_alumno INT NOT NULL UNIQUE,
    fecha_apertura DATE NOT NULL,
    antecedentes_personales TEXT NULL,
    antecedentes_familiares TEXT NULL,
    observaciones_generales TEXT NULL,
    estado_expediente ENUM('Abierto', 'En Seguimiento', 'Cerrado') NOT NULL DEFAULT 'Abierto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historias_alumnos FOREIGN KEY (id_alumno) REFERENCES alumnos(id_alumno) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabla 9: SESIONES_ATENCION
-- Registro detallado de cada consulta efectuada
-- ----------------------------------------------------------------------------
CREATE TABLE sesiones_atencion (
    id_sesion INT AUTO_INCREMENT PRIMARY KEY,
    id_historia INT NOT NULL,
    id_cita INT NOT NULL UNIQUE,
    id_psicologo INT NOT NULL,
    fecha_atencion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    numero_sesion INT NOT NULL DEFAULT 1,
    diagnostico_presuntivo TEXT NOT NULL,
    evaluacion_psicologica TEXT NULL,
    plan_intervencion TEXT NOT NULL,
    recomendaciones TEXT NULL,
    proxima_cita_sugerida DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sesiones_historias FOREIGN KEY (id_historia) REFERENCES historias_clinicas(id_historia) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sesiones_citas FOREIGN KEY (id_cita) REFERENCES citas(id_cita) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sesiones_psicologos FOREIGN KEY (id_psicologo) REFERENCES psicologos(id_psicologo) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
-- ----------------------------------------------------------------------------
CREATE INDEX idx_citas_fecha ON citas(fecha_cita);
CREATE INDEX idx_citas_estado ON citas(estado_cita);
CREATE INDEX idx_alumnos_dni ON alumnos(dni);
CREATE INDEX idx_alumnos_codigo ON alumnos(codigo_estudiantil);
CREATE INDEX idx_usuarios_correo ON usuarios(correo_institucional);
