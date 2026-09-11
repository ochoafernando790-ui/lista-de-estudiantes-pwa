-- Version para hosting compartido (InfinityFree y similares).
-- NO incluye CREATE DATABASE / USE: en hosting compartido no tienes permiso
-- para crear bases nuevas. Antes de importar, selecciona en phpMyAdmin la
-- base de datos que ya creaste desde el panel (MySQL Databases).

DROP TABLE IF EXISTS estudiantes;

CREATE TABLE estudiantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  edad INT NOT NULL,
  sexo VARCHAR(20) NOT NULL,
  carrera VARCHAR(120) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  correo VARCHAR(150) NOT NULL,
  foto LONGTEXT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO estudiantes (nombre, edad, sexo, carrera, telefono, correo, foto) VALUES
('Carlos Mendoza', 20, 'Masculino', 'Ingeniería en Sistemas', '78901234', 'carlos.mendoza@estudiante.edu.sv', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400'),
('Ana Lucía Torres', 22, 'Femenino', 'Licenciatura en Computación', '71234567', 'ana.torres@estudiante.edu.sv', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'),
('Roberto Gómez', 21, 'Masculino', 'Ingeniería Industrial', '75678901', 'roberto.gomez@estudiante.edu.sv', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
('Sofía Hernández', 19, 'Femenino', 'Diseño Gráfico', '73456789', 'sofia.hernandez@estudiante.edu.sv', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'),
('Diego Ramos', 23, 'Masculino', 'Licenciatura en Administración', '79012345', 'diego.ramos@estudiante.edu.sv', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'),
('Valeria Castro', 20, 'Femenino', 'Ingeniería en Sistemas', '72345678', 'valeria.castro@estudiante.edu.sv', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'),
('Fernando López', 24, 'Masculino', 'Ingeniería Industrial', '76789012', 'fernando.lopez@estudiante.edu.sv', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400'),
('Gabriela Morales', 21, 'Femenino', 'Diseño Gráfico', '74567890', 'gabriela.morales@estudiante.edu.sv', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400'),
('Jorge Martínez', 22, 'Masculino', 'Licenciatura en Computación', '70123456', 'jorge.martinez@estudiante.edu.sv', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400'),
('Mariana Aguilar', 20, 'Femenino', 'Licenciatura en Administración', '77890123', 'mariana.aguilar@estudiante.edu.sv', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400');
