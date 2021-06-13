const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers');

const pool = require('../database');
const { isLoggedIn, bloqueado, administrador } = require('../lib/auth');

router.get('/',  isLoggedIn, bloqueado, administrador, async (req, res) => {
    const users = await pool.query('SELECT * FROM users WHERE ID != ?',[req.user.id]);
    const admin = await pool.query('SELECT * FROM users WHERE tipo_usuario = "Admin" and id = ?',[req.user.id]);     
    const cliente = await pool.query('SELECT * FROM users WHERE tipo_usuario = "comprador" and id = ?',[req.user.id]);
    res.render('cuentas/list', { users, admin, cliente });
});

router.get('/delete/:id', isLoggedIn, bloqueado, administrador,  async (req, res) => {
    const { id } = req.params;

    const row = await pool.query('SELECT nombre FROM users WHERE id = ?', [id]);
    const tienda = row[0];    
    const actividad_realizada = "Eliminó la cuenta de " + tienda.nombre;
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

    await pool.query('DELETE FROM venta WHERE id_cliente_venta = ?', [id]);
    await pool.query('DELETE FROM carrito WHERE id_cliente = ?', [id]);
    await pool.query('DELETE FROM users WHERE ID = ?', [id]);    
    req.flash('success', 'La cuenta fue eliminada');
    res.redirect('/cuentas');
});

router.get('/bloquear/:id',  isLoggedIn, bloqueado, administrador, async (req, res) => {
    const { id } = req.params;
    const admin = await pool.query('UPDATE users set reportado = "bloqueado" WHERE id = ?',[id]); 

    const row = await pool.query('SELECT nombre FROM users WHERE id = ?', [id]);
    const tienda = row[0];    
    const actividad_realizada = "bloqueó la cuenta de " + tienda.nombre;
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

    req.flash('success', 'La cuenta fue bloqueada');
    res.redirect('/cuentas');
});

router.get('/activar/:id',  isLoggedIn, bloqueado, administrador, async (req, res) => {
    const { id } = req.params;
    await pool.query('UPDATE users set reportado = "activo" WHERE id = ?',[id]);
    await pool.query('UPDATE users set intentos = "0" WHERE id = ?',[id]); 

    const row = await pool.query('SELECT nombre FROM users WHERE id = ?', [id]);
    const tienda = row[0];    
    const actividad_realizada = "Activó la cuenta de " + tienda.nombre;
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

    req.flash('success', 'La cuenta fue activada');
    res.redirect('/cuentas');
});

router.get('/editar/:id',  isLoggedIn, bloqueado, administrador, async (req, res) => {
    const { id } = req.params;
    const users = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
         const admin = await pool.query('SELECT * FROM users WHERE tipo_usuario = "Admin" and id = ?',[req.user.id]);     
         const cliente = await pool.query('SELECT * FROM users WHERE tipo_usuario = "comprador" and id = ?',[req.user.id]);
    res.render('cuentas/edit', { usere: users[0], admin, cliente });
});

router.post('/editar/:id', isLoggedIn, bloqueado, administrador,  async (req, res) => {
    const { id } = req.params;
    const { username, nombre, apellidos, tipo_usuario } = req.body;
    const newUser = {
        username,
        nombre,
        apellidos,
        tipo_usuario
    };

    const rows = await pool.query('SELECT * FROM users WHERE username = ? AND id != ?', [username, id]);
    if (rows.length > 0){
       req.flash('message', 'Use un correo electrónico no registrado');
       res.redirect(req.get('referer'));
    }else{
        await pool.query('UPDATE users set ? WHERE id = ?', [newUser, id]);

        const actividad_realizada = "Editó la cuenta de " + nombre;
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

        req.flash('success', '¡Cuenta actualizada!');
        res.redirect('/cuentas');
    }
});

module.exports = router;