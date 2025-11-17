-- Script simple para agregar la columna archivo_ruta
-- Ejecuta este script en tu base de datos MySQL
-- IMPORTANTE: Ejecuta este script completo en phpMyAdmin o tu cliente MySQL

USE `gestion_centralizada`;

-- Paso 1: Intentar eliminar columna antigua archivo_exe (ignorar error si no existe)
SET @sql = 'ALTER TABLE `solicitudes_instalacion` DROP COLUMN `archivo_exe`';
SET @ignore = (
    SELECT IF(
        (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = 'gestion_centralizada' 
         AND TABLE_NAME = 'solicitudes_instalacion' 
         AND COLUMN_NAME = 'archivo_exe') > 0,
        @sql,
        'SELECT "Columna archivo_exe no existe, continuando..." AS Mensaje'
    )
);
SET @sql = @ignore;
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Paso 2: Verificar si archivo_ruta ya existe, si no, agregarla
SET @sql = (
    SELECT IF(
        (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = 'gestion_centralizada' 
         AND TABLE_NAME = 'solicitudes_instalacion' 
         AND COLUMN_NAME = 'archivo_ruta') > 0,
        'SELECT "Columna archivo_ruta ya existe" AS Mensaje',
        'ALTER TABLE `solicitudes_instalacion` ADD COLUMN `archivo_ruta` VARCHAR(500) NULL COMMENT ''Ruta del archivo en el sistema de archivos (distribucion/exe/ o distribucion/docs/)'' AFTER `nombre_software`'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✅ Script ejecutado correctamente. La columna archivo_ruta está lista.' AS 'Mensaje';

