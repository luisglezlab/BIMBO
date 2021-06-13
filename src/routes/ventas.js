const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers');

const pool = require('../database');
const { isLoggedIn, bloqueado, administrador } = require('../lib/auth');


router.get('/',  isLoggedIn, bloqueado, administrador, async (req, res) => {
    const admin = await pool.query('SELECT * FROM users WHERE tipo_usuario = "Admin" and id = ?',[req.user.id]);    
    const cliente = await pool.query('SELECT * FROM users WHERE tipo_usuario = "comprador" and id = ?',[req.user.id]); 
    const venta = await pool.query('SELECT * FROM venta INNER JOIN users ON id = id_cliente_venta ORDER BY created_at DESC');
   
    
    res.render('ventas/list', { admin, cliente, venta});
});


module.exports = router;