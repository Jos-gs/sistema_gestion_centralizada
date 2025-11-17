-- Título: db_schema.sql
-- Descripción: Script para crear la base de datos y las tablas necesarias
--              para el Sistema de Gestión Centralizada.

-- 1. CREAR LA BASE DE DATOS
    CREATE DATABASE IF NOT EXISTS `gestion_centralizada` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
    USE `gestion_centralizada`;

-- 2. TABLA DE USUARIOS (Para manejar roles: Ingeniero y Docente)
CREATE TABLE IF NOT EXISTS `usuarios` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre de usuario para login',
    `password_hash` VARCHAR(255) NOT NULL COMMENT 'Contraseña cifrada con bcrypt',
    `cargo` ENUM('Ingeniero', 'Docente') NOT NULL COMMENT 'Rol del usuario',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE TAREAS (Para registrar la distribución de documentos)
CREATE TABLE IF NOT EXISTS `tareas` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `document_name` VARCHAR(255) NOT NULL COMMENT 'Nombre del archivo a distribuir',
    `document_url` VARCHAR(500) NULL COMMENT 'URL simulada de descarga', 
    `target_classroom` VARCHAR(50) NOT NULL COMMENT 'Destino de la tarea (Aula 1, Aula 2, Todas)',
    `status` ENUM('PENDIENTE', 'DISTRIBUIDO', 'FALLIDO') DEFAULT 'PENDIENTE',
    `registered_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.1. TABLA ALTERNATIVA: registros_documentos (si se usa en el código)
CREATE TABLE IF NOT EXISTS `registros_documentos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `documento_nombre` VARCHAR(255) NOT NULL COMMENT 'Nombre del archivo a distribuir',
    `documento_url` VARCHAR(500) NULL COMMENT 'URL simulada de descarga', 
    `salon_destino` VARCHAR(50) NOT NULL COMMENT 'Destino de la tarea (Aula 1, Aula 2, Todas)',
    `estado` ENUM('PENDIENTE', 'DISTRIBUIDO', 'FALLIDO') DEFAULT 'PENDIENTE',
    `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.2. TABLA DE USUARIOS CON NOMBRE COMPLETO (si se usa en el código)
ALTER TABLE `usuarios` 
ADD COLUMN IF NOT EXISTS `nombre_completo` VARCHAR(100) NULL COMMENT 'Nombre completo del usuario' AFTER `username`,
ADD COLUMN IF NOT EXISTS `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `cargo`;

-- 4. TABLA DE CONSULTAS Y SOLICITUDES DEL CHATBOT
CREATE TABLE IF NOT EXISTS `consultas_chatbot` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NULL COMMENT 'ID del usuario que hace la consulta',
    `username` VARCHAR(50) NOT NULL COMMENT 'Nombre de usuario',
    `tipo` ENUM('CONSULTA', 'SOLICITUD', 'REPORTE', 'SUGERENCIA') DEFAULT 'CONSULTA',
    `categoria` VARCHAR(50) NULL COMMENT 'Categoría: soporte, sistema, tutorial, etc.',
    `mensaje` TEXT NOT NULL COMMENT 'Mensaje del usuario',
    `respuesta` TEXT NULL COMMENT 'Respuesta del chatbot o administrador',
    `estado` ENUM('PENDIENTE', 'RESUELTA', 'EN_PROCESO') DEFAULT 'PENDIENTE',
    `fecha_consulta` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `fecha_respuesta` TIMESTAMP NULL,
    INDEX `idx_usuario` (`usuario_id`),
    INDEX `idx_estado` (`estado`),
    INDEX `idx_tipo` (`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. TABLA DE SOLICITUDES DE INSTALACIÓN DE SOFTWARE
CREATE TABLE IF NOT EXISTS `solicitudes_instalacion` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NULL COMMENT 'ID del usuario que hace la solicitud',
    `username` VARCHAR(50) NOT NULL COMMENT 'Nombre de usuario',
    `nombre_software` VARCHAR(255) NOT NULL COMMENT 'Nombre del software a instalar',
    `archivo_ruta` VARCHAR(500) NULL COMMENT 'Ruta del archivo en el sistema de archivos (distribucion/exe/ o distribucion/docs/)',
    `nombre_archivo` VARCHAR(255) NULL COMMENT 'Nombre original del archivo',
    `tipo_archivo` VARCHAR(50) NULL COMMENT 'Tipo MIME del archivo',
    `tamaño_archivo` BIGINT NULL COMMENT 'Tamaño del archivo en bytes',
    `salon_destino` VARCHAR(50) NOT NULL COMMENT 'Salón donde instalar (Aula 1, Aula 2, etc.)',
    `mensaje_solicitud` TEXT NULL COMMENT 'Mensaje adicional de la solicitud',
    `estado` ENUM('PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'FALLIDA') DEFAULT 'PENDIENTE',
    `script_powershell` TEXT NULL COMMENT 'Script PowerShell generado automáticamente',
    `resultado_ejecucion` TEXT NULL COMMENT 'Resultado de la ejecución del script',
    `fecha_solicitud` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `fecha_completada` TIMESTAMP NULL,
    INDEX `idx_usuario` (`usuario_id`),
    INDEX `idx_estado` (`estado`),
    INDEX `idx_salon` (`salon_destino`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. INSERTAR DATOS INICIALES (Contraseña para ambos: "password")
-- Usuarios de prueba: ing_admin / password y docente_aula / password

INSERT INTO `usuarios` (`username`, `password_hash`, `cargo`) VALUES
('ing_admin', '$2y$10$tM2M7q0J8b5b5m2L6G1O9e5W8Q0V7Q8P6S4R3T2U1X9Y8Z7A6B5C4D3E2F1G0', 'Ingeniero'),
('docente_aula', '$2y$10$tM2M7q0J8b5b5m2L6G1O9e5W8Q0V7Q8P6S4R3T2U1X9Y8Z7A6B5C4D3E2F1G0', 'Docente');

SELECT 'Base de datos y tablas creadas e inicializadas con éxito.' AS 'Mensaje';