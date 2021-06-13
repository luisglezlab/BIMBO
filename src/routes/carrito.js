const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers');

const pool = require('../database');
const { isLoggedIn, bloqueado, cliente } = require('../lib/auth');


router.get('/',  isLoggedIn, bloqueado, cliente, async (req, res) => {
    const admin = await pool.query('SELECT * FROM users WHERE tipo_usuario = "Admin" and id = ?',[req.user.id]);    
    const cliente = await pool.query('SELECT * FROM users WHERE tipo_usuario = "comprador" and id = ?',[req.user.id]); 
    const total = await pool.query('SELECT FORMAT(SUM(costo * cantidad),2) as total FROM carrito WHERE id_cliente = ?', [req.user.id]);
    const carritos = await pool.query('SELECT id_producto_carrito, id_cliente, nombre_producto_carrito, FORMAT(costo,2) costo, FORMAT(costo * SUM(cantidad),2) AS parcial, SUM(cantidad) AS cantidad_total FROM carrito WHERE id_cliente = ? GROUP BY nombre_producto_carrito', [req.user.id]);
    const cantidad_carrito = await pool.query('SELECT SUM(cantidad) AS pro_total FROM carrito WHERE id_cliente = ?', [req.user.id]);
    
    
    res.render('carrito/list', { admin, cliente, carritos, total, cantidad_carrito});
});

router.post('/add',  isLoggedIn, bloqueado, cliente, async (req, res) => {
    const id_cliente = req.user.id;
    const { id_producto_carrito, nombre_producto_carrito, costo, cantidad } = req.body;

    const newLink = {
        id_producto_carrito,
        nombre_producto_carrito,
        costo,
        cantidad,
        id_cliente
    };
    await pool.query('INSERT INTO carrito set ?', [newLink]);

    await pool.query('UPDATE productos set stock = (stock - ?) WHERE id_producto = ?',[cantidad, id_producto_carrito]);

    req.flash('success', 'Tu producto ha sido añadido al carrito de compras');
    res.redirect('/inicio');
});


router.get('/delete/:id_producto_carrito', isLoggedIn, bloqueado,  async (req, res) => {
    const { id_producto_carrito } = req.params;
    
    cantidad = await pool.query('SELECT SUM(cantidad) as suma from carrito WHERE id_producto_carrito = ? and id_cliente = ?', [id_producto_carrito, req.user.id]);
    
    await pool.query('DELETE FROM carrito WHERE id_producto_carrito = ? and id_cliente = ?', [id_producto_carrito, req.user.id]);    
    await pool.query('UPDATE productos set stock = (stock + ?) WHERE id_producto = ?',[cantidad[0].suma, id_producto_carrito]);

    req.flash('success', 'Articulos eliminados del carrito');
    res.redirect('/carrito');
});


router.get('/comprar',  isLoggedIn, bloqueado, cliente, async (req, res) => {
    const suma = await pool.query('SELECT FORMAT(SUM(costo * cantidad),2) as total FROM carrito WHERE id_cliente = ?', [req.user.id]);
    const id_cliente_venta = req.user.id;
    const costo_venta = suma[0].total;
    const newLink = {
        costo_venta,
        id_cliente_venta
    };
    await pool.query('INSERT INTO venta set ?', [newLink]);

    await pool.query('DELETE FROM carrito WHERE id_cliente = ?', [id_cliente_venta]);   
    


    const actividad_realizada = "Realizó una compra de $ " + costo_venta;
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

    

    req.flash('success', 'Tu compra se realizó exitosamente');
    res.redirect('/compras/');
});


module.exports = router;