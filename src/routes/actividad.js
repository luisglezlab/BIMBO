const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers');

const pool = require('../database');
const { isLoggedIn, bloqueado, administrador } = require('../lib/auth');


router.get('/',  isLoggedIn, bloqueado, administrador, async (req, res) => {
    const actividad = await pool.query('SELECT users.id, users.nombre, users.username, actividad.actividad_realizada, actividad.tiempo, actividad.ip FROM users INNER JOIN actividad ON users.id=actividad.user_id ORDER BY tiempo DESC');
    
         const admin = await pool.query('SELECT * FROM users WHERE tipo_usuario = "Admin" and id = ?',[req.user.id]);    
         const cliente = await pool.query('SELECT * FROM users WHERE tipo_usuario = "comprador" and id = ?',[req.user.id]);
    res.render('actividad/list', { actividad, admin, cliente});
});

router.get('/:id',  isLoggedIn, bloqueado, administrador, async (req, res) => {
    const { id } = req.params;
    const actividad = await pool.query('SELECT users.nombre, users.username, actividad.actividad_realizada, actividad.tiempo, actividad.ip FROM users INNER JOIN actividad ON users.id=actividad.user_id WHERE users.id = ? ORDER BY tiempo DESC', [id]);
    const nombresito = await pool.query('SELECT nombre FROM users WHERE id = ?', [id]);
    const nombre_usuario = nombresito[0].nombre;
    const admin = await pool.query('SELECT * FROM users WHERE tipo_usuario = "Admin" and id = ?',[req.user.id]);    
    const cliente = await pool.query('SELECT * FROM users WHERE tipo_usuario = "comprador" and id = ?',[req.user.id]);
    res.render('actividad/listesp', { nombre_usuario, actividad, admin, cliente});
});

module.exports = router;