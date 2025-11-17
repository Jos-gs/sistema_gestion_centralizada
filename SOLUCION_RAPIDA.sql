-- ⚡ SOLUCIÓN RÁPIDA - Copia y pega esto en phpMyAdmin
-- Ejecuta este script completo de una vez

USE `gestion_centralizada`;

-- Paso 1: Eliminar columna antigua archivo_exe (ejecuta esto primero)
-- Si da error diciendo que no existe, ignóralo y continúa con el paso 2
ALTER TABLE `solicitudes_instalacion` DROP COLUMN `archivo_exe`;

-- Paso 2: Agregar nueva columna archivo_ruta
ALTER TABLE `solicitudes_instalacion` 
ADD COLUMN `archivo_ruta` VARCHAR(500) NULL 
COMMENT 'Ruta del archivo en el sistema de archivos (distribucion/exe/ o distribucion/docs/)' 
AFTER `nombre_software`;

-- Paso 3: Verificar que se creó correctamente
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'gestion_centralizada' 
AND TABLE_NAME = 'solicitudes_instalacion' 
AND COLUMN_NAME = 'archivo_ruta';

