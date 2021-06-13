const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers');

const pool = require('../database');
const passport = require('passport');
const { isLoggedIn, bloqueado, cliente, nobloqueado, isNotLoggedIn } = require('../lib/auth');

router.post('/signup', isNotLoggedIn, passport.authenticate('local.signup', {
    successRedirect: '/inicio',
    failureRedirect: '/',
    failureFlash: true
}));

router.get('/signin', isNotLoggedIn, (req, res) => {
    res.render('auth/signin');
});

router.get('/inicio',  isLoggedIn, bloqueado, bloqueado, cliente, async (req, res) => {
    const admin = await pool.query('SELECT * FROM users WHERE tipo_usuario = "Admin" and id = ?',[req.user.id]);     
    const cliente = await pool.query('SELECT * FROM users WHERE tipo_usuario = "comprador" and id = ?',[req.user.id]);
    const cantidad_carrito = await pool.query('SELECT SUM(cantidad) AS pro_total FROM carrito WHERE id_cliente = ?', [req.user.id]);
    
    const order = req.query.orderby;
    if(order == undefined){
        const order = "A-Z";
        const productos = await pool.query('SELECT id_producto, nombre_producto, description, imagen, FORMAT(costo,2) costo, stock FROM productos ORDER BY nombre_producto ASC');
    res.render('inicio', { productos, admin, cliente, order, cantidad_carrito });    
    }else{
        if(order == "A-Z"){
            const productos = await pool.query('SELECT id_producto, nombre_producto, description, imagen, FORMAT(costo,2) costo, stock FROM productos ORDER BY nombre_producto ASC');
            res.render('inicio', { productos, admin, cliente, order, cantidad_carrito });
        }else if(order == "Z-A"){
            const productos = await pool.query('SELECT id_producto, nombre_producto, description, imagen, FORMAT(costo,2) costo, stock FROM productos ORDER BY nombre_producto DESC');
            res.render('inicio', { productos, admin, cliente, order, cantidad_carrito });
        }else if(order == "Mayor precio"){
            const productos = await pool.query('SELECT id_producto, nombre_producto, description, imagen, FORMAT(costo,2) costo, stock FROM productos ORDER BY costo DESC');
            res.render('inicio', { productos, admin, cliente, order, cantidad_carrito });
        } else if(order == "Menor precio"){
            const productos = await pool.query('SELECT id_producto, nombre_producto, description, imagen, FORMAT(costo,2) costo, stock FROM productos ORDER BY costo ASC');
            res.render('inicio', { productos, admin, cliente, order, cantidad_carrito });
        }    
    }

});


router.get('/reportar/:id',  isLoggedIn, bloqueado, async (req, res) => {
    const { id } = req.params;
    const admin = await pool.query('UPDATE users set reportado = "reportado" WHERE id = ?',[id]); 


    const row = await pool.query('SELECT nombre FROM users WHERE id = ?', [id]);
    const tienda = row[0];    
    const actividad_realizada = "reportó a " + tienda.nombre;
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

    req.flash('success', 'La cuenta fue reportada');
    res.redirect('/inicio');
});

router.get('/bloqueado',  isLoggedIn, nobloqueado, async (req, res) => {
    res.render('bloqueado');
});

router.post('/actividad',  isLoggedIn, bloqueado, async (req, res) => {
    const { actividad_realizada, costo } = req.body;
    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    if (ip.includes('::ffff:')) {
        ip = ip.split(':').reverse()[0]
    }
    console.log(ip);
    const newLink = {
        actividad_realizada,
        ip,
        user_id: req.user.id
    };
    await pool.query('INSERT INTO actividad set ?', [newLink]);
    res.redirect(costo);
});

router.get('/logout', isLoggedIn, async (req, res) => {

              
    const actividad_realizada = "Cerro sesión";
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

    await pool.query('DELETE FROM carrito WHERE id_cliente = ?', [req.user.id])

    req.logOut();
    res.redirect('/');
});
router.post('/signin', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local.signin',{
       successRedirect: '/inicio',
       failureRedirect: '/signin',
       failureFlash: true 
    })(req, res, next);
});

module.exports = router;