const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers');

const pool = require('../database');
const { isLoggedIn, bloqueado, cliente } = require('../lib/auth');


router.get('/',  isLoggedIn, bloqueado, cliente, async (req, res) => {
    const admin = await pool.query('SELECT * FROM users WHERE tipo_usuario = "Admin" and id = ?',[req.user.id]);    
    const cliente = await pool.query('SELECT * FROM users WHERE tipo_usuario = "comprador" and id = ?',[req.user.id]); 
    const compra = await pool.query('SELECT * FROM venta WHERE id_cliente_venta = ? ORDER BY created_at DESC', [req.user.id]);
    const cantidad_carrito = await pool.query('SELECT SUM(cantidad) AS pro_total FROM carrito WHERE id_cliente = ?', [req.user.id]);
   
    
    res.render('compras/list', { admin, cliente, compra, cantidad_carrito});
});


module.exports = router;