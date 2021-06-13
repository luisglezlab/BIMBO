CREATE DATABASE BIMBO;

USE BIMBO;
USE pan_luis2;

CREATE TABLE users(
    id INT(10) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	apellidos VARCHAR(50) NOT NULL,
    tipo_usuario VARCHAR(50) NOT NULL,
    reportado VARCHAR(50) NOT NULL,
    intentos INT(1) NOT NULL
);

CREATE TABLE productos(
 id_pr INT(10) NOT NULL,
 nombre VARCHAR(50) NOT NULL,
 description TEXT,
 precio VARCHAR(20) NOT NULL,
 user_id INT(10),
 created_at timestamp NOT NULL DEFAULT current_timestamp,
 CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE productos(
 id_producto INT(10) NOT NULL primary key auto_increment,
 nombre_producto VARCHAR(50) NOT NULL,
 description TEXT,
 costo DECIMAL(8,2) NOT NULL,
 stock INT(10) NOT NULL
);

CREATE TABLE carrito(
	id_registro INT(10) NOT NULL primary key auto_increment,
    nombre_producto_carrito varchar(50) NOT NULL,
    costo DECIMAL(8,2) NOT NULL,
    cantidad INT(10) NOT NULL,
    id_cliente int (10),
    CONSTRAINT fk_user FOREIGN KEY (id_cliente) REFERENCES users(id)
);

CREATE TABLE venta(
	id_venta INT(10) NOT NULL primary key auto_increment,
    costo_venta DECIMAL(8,2) NOT NULL,
    id_cliente_venta int (10),
	created_at timestamp NOT NULL DEFAULT current_timestamp,
    CONSTRAINT fk_venta FOREIGN KEY (id_cliente_venta) REFERENCES users(id)
);

drop table venta;

CREATE TABLE actividad(
 id_act INT(10) NOT NULL PRIMARY KEY AUTO_INCREMENT,
 actividad_realizada VARCHAR(200) NOT NULL,
 user_id VARCHAR(50) NOT NULL,
 ip VARCHAR(50) NOT NULL,
 tiempo timestamp NOT NULL DEFAULT current_timestamp
);

drop table tiendas;

UPDATE users set reportado = "bloqueado" WHERE id = "16";
UPDATE users set reportado = "activo" WHERE id = "16";
UPDATE users set intentos = "0" WHERE id = "16";
UPDATE users set tipo_usuario = "Admin" WHERE id = "2";

UPDATE productos set stock = (stock-2) WHERE id_producto = "6";

alter table productos add imagen varchar(150);
alter table carrito add id_producto_carrito int (10) not null;
alter table actividad modify actividad_realizada varchar(200) not null;

USE BIMBO;
USE pan_luis2;

select count(*) as total from productos;

select * from productos;
select * from actividad;
select * from users;
select * from tiendas;
select * from carrito;
select * from venta;

describe actividad;
describe users;
describe productos;
describe carrito;
describe venta;
describe sessions;

truncate actividad;
truncate carrito;

DESCRIBE pan_luis2;