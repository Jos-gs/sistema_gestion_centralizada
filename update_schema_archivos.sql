-- Script para actualizar la tabla solicitudes_instalacion
-- Cambia de almacenar BLOB a almacenar rutas de archivos

USE `gestion_centralizada`;

-- Verificar y eliminar la columna antigua archivo_exe (LONGBLOB) si existe
-- Nota: Esto eliminará los datos de archivos almacenados como BLOB
-- Si necesitas mantener esos datos, primero debes exportarlos manualmente

-- Paso 1: Eliminar la columna archivo_exe si existe
SET @dbname = DATABASE();
SET @tablename = 'solicitudes_instalacion';
SET @columnname = 'archivo_exe';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  CONCAT('ALTER TABLE `', @tablename, '` DROP COLUMN `', @columnname, '`;'),
  'SELECT "Columna archivo_exe no existe, no se necesita eliminar" AS Mensaje;'
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

-- Paso 2: Agregar la nueva columna archivo_ruta si no existe
SET @columnname = 'archivo_ruta';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT "Columna archivo_ruta ya existe" AS Mensaje;',
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` VARCHAR(500) NULL COMMENT ''Ruta del archivo en el sistema de archivos (distribucion/exe/ o distribucion/docs/)'' AFTER `nombre_software`;')
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

SELECT 'Tabla actualizada correctamente. Los archivos ahora se guardan en distribucion/exe/ y distribucion/docs/' AS 'Mensaje';

