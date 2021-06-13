const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn, bloqueado, administrador } = require('../lib/auth');

router.get('/add', isLoggedIn, bloqueado, administrador, async (req, res) => {
    const admin = await pool.query('SELECT * FROM users WHERE tipo_usuario = "Admin" and id = ?',[req.user.id]);
    const cliente = await pool.query('SELECT * FROM users WHERE tipo_usuario = "comprador" and id = ?',[req.user.id]);
    res.render('productos/add', {admin, cliente});
});

router.post('/add',  isLoggedIn, bloqueado, administrador, async (req, res) => {
    const { nombre_producto, description, costo, stock, imagen } = req.body;
    const newLink = {
        nombre_producto,
        description,
        costo,
        stock,
        imagen
    };
    await pool.query('INSERT INTO productos set ?', [newLink]);


    const actividad_realizada = "Creó el producto " + nombre_producto;
    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    if (ip.includes('::ffff:')) {
        ip = ip.split(':').reverse()[0]
    }
    console.log(ip);
    const actividad = {
        actividad_realizada,
        ip,
        user_id: req.user.id
    };
    await pool.query('INSERT INTO actividad set ?', [actividad]);

    
    
    req.flash('success', 'Tu producto ha sido registrado exitosamente');
    res.redirect('/productos');
});

router.get('/',  isLoggedIn, bloqueado, administrador, async (req, res) => {
    const productos = await pool.query('SELECT id_producto, nombre_producto, description, imagen, FORMAT(costo,2) costo, stock FROM productos ORDER BY nombre_producto ASC');
    const total_productos = await pool.query('SELECT COUNT(*) as total FROM productos'); 
    const total = total_productos[0];
        const admin = await pool.query('SELECT * FROM users WHERE tipo_usuario = "Admin" and id = ?',[req.user.id]);     
         const cliente = await pool.query('SELECT * FROM users WHERE tipo_usuario = "comprador" and id = ?',[req.user.id]);
    res.render('productos/list', { productos, admin, cliente, total });
});

router.get('/delete/:id', isLoggedIn, bloqueado, administrador,  async (req, res) => {
    const { id } = req.params;
    const row = await pool.query('SELECT nombre_producto FROM productos WHERE id_producto = ?', [id]);
    const producto = row[0];    
    const actividad_realizada = "Eliminó el producto " + producto.nombre_producto;
    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    if (ip.includes('::ffff:')) {
        ip = ip.split(':').reverse()[0]
    }
    console.log(ip);
    const actividad = {
        actividad_realizada,
        ip,
        user_id: req.user.id
    };
    await pool.query('INSERT INTO actividad set ?', [actividad]);

    
    await pool.query('DELETE FROM productos WHERE id_producto = ?', [id]);
    req.flash('success', 'Tu producto ha sido eliminado');
    res.redirect('/productos');
});

router.get('/edit/:id',  isLoggedIn, bloqueado, administrador, async (req, res) => {
    const { id } = req.params;
    const productos = await pool.query('SELECT id_producto, nombre_producto, description, FORMAT(costo,2) costo, stock FROM productos WHERE id_producto = ?', [id]);
    const admin = await pool.query('SELECT * FROM users WHERE tipo_usuario = "Admin" and id = ?',[req.user.id]);     
    const cliente = await pool.query('SELECT * FROM users WHERE tipo_usuario = "comprador" and id = ?',[req.user.id]);
    res.render('productos/edit', { producto: productos[0], admin, cliente });
});

router.get('/edit_imagen/:id',  isLoggedIn, bloqueado, administrador, async (req, res) => {
    const { id } = req.params;
    const productos = await pool.query('SELECT id_producto, nombre_producto, imagen, description, FORMAT(costo,2) costo, stock FROM productos WHERE id_producto = ?', [id]);
    const admin = await pool.query('SELECT * FROM users WHERE tipo_usuario = "Admin" and id = ?',[req.user.id]);     
    const cliente = await pool.query('SELECT * FROM users WHERE tipo_usuario = "comprador" and id = ?',[req.user.id]);
    res.render('productos/edit_imagen', { producto: productos[0], admin, cliente });
});

router.post('/edit/:id', isLoggedIn, bloqueado, administrador,  async (req, res) => {
    const { id } = req.params;
    const { nombre_producto, description, costo, stock } = req.body;
    const newLink = {
        nombre_producto,
        description,
        costo,
        stock
    };
    await pool.query('UPDATE productos set ? WHERE id_producto = ?', [newLink, id]);


    const actividad_realizada = "Editó el producto " + nombre_producto;
    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    if (ip.includes('::ffff:')) {
        ip = ip.split(':').reverse()[0]
    }
    console.log(ip);
    const actividad = {
        actividad_realizada,
        ip,
        user_id: req.user.id
    };
    await pool.query('INSERT INTO actividad set ?', [actividad]);

    
    req.flash('success', 'Tu producto ha sido actualizado');
    res.redirect('/productos');
});

router.post('/edit_imagen/:id', isLoggedIn, bloqueado, administrador,  async (req, res) => {
    const { id } = req.params;
    const { imagen } = req.body;
    const newLink = {
        imagen
    };
    nombre_producto = await pool.query('SELECT nombre_producto FROM productos WHERE id_producto = ?', [id]);
    await pool.query('UPDATE productos set ? WHERE id_producto = ?', [newLink, id]);


    const actividad_realizada = "Cambió la imagen del producto " + nombre_producto[0].nombre_producto;
    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    if (ip.includes('::ffff:')) {
        ip = ip.split(':').reverse()[0]
    }
    console.log(ip);
    const actividad = {
        actividad_realizada,
        ip,
        user_id: req.user.id
    };
    await pool.query('INSERT INTO actividad set ?', [actividad]);

    
    req.flash('success', 'Tu producto ha sido actualizado');
    res.redirect('/productos');
});

module.exports = router;