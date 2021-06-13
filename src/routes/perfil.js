
const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers');

const pool = require('../database');
const { isLoggedIn, bloqueado } = require('../lib/auth');



router.get('/editar',  isLoggedIn, bloqueado, async (req, res) => {
    const users = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
         const admin = await pool.query('SELECT * FROM users WHERE tipo_usuario = "Admin" and id = ?',[req.user.id]);     
         const cliente = await pool.query('SELECT * FROM users WHERE tipo_usuario = "comprador" and id = ?',[req.user.id]);
         const cantidad_carrito = await pool.query('SELECT SUM(cantidad) AS pro_total FROM carrito WHERE id_cliente = ?', [req.user.id]);
    
    
    res.render('perfil/configurar', {admin, cliente, cantidad_carrito});
});

router.post('/editar', isLoggedIn, bloqueado,  async (req, res) => {
    const { username, nombre, apellidos, password } = req.body;
    const tipo_usuario = req.user.tipo_usuario;
    const newUser = {
        username,
        nombre,
        apellidos,
        tipo_usuario,
        password
    };
    const rows = await pool.query('SELECT * FROM users WHERE username = ? AND id != ?', [username, req.user.id]);
    if (rows.length > 0){
       req.flash('message', 'Use un correo electrónico no registrado');
       res.redirect(req.get('referer'));
    }else{
        newUser.password = await helpers.encryptPassword(password);
        await pool.query('UPDATE users set ? WHERE id = ?', [newUser, req.user.id]);


        const actividad_realizada = "Editó su cuenta";
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
        res.redirect('/inicio');    
    }
});


module.exports = router;