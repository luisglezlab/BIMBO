const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');
const helpers = require('../lib/helpers');

passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0){
        const user = rows[0];
        const validPassword = await helpers.matchPassword(password, user.password);
        
        if(user.intentos == 3){
            done(null, false, req.flash('message', 'Lo sentimos, por seguridad tu usuario ha sido bloqueado, contacta al administrador.'));
        }else{

            if (validPassword){              

                await pool.query('UPDATE users set intentos = "0" WHERE id = ?', [user.id]); 

                const actividad_realizada = "Inició sesión";
                var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
                if (ip.includes('::ffff:')) {
                    ip = ip.split(':').reverse()[0]
                }
                console.log(ip);
                const actividad = {
                    actividad_realizada,
                    ip,
                    user_id: user.id
                };
                await pool.query('INSERT INTO actividad set ?', [actividad]);

                done(null, user, req.flash('success', '¡Hola de nuevo, ' + user.nombre + '!'));
            }else{
                if(user.intentos == 0){
                    done(null, false, req.flash('message', 'Contraseña incorrecta, tienes 2 intentos más o tu usuario será bloqueado.'));
                    await pool.query('UPDATE users set intentos = "1" WHERE username = ?', [username]); 
                    
                    
                    const actividad_realizada = "1 intento fallido al ingresar";
                    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
                    if (ip.includes('::ffff:')) {
                        ip = ip.split(':').reverse()[0]
                    }
                    console.log(ip);
                    const actividad = {
                        actividad_realizada,
                        ip,
                        user_id: user.id
                    };
                    await pool.query('INSERT INTO actividad set ?', [actividad]);


                }if(user.intentos == 1){
                    done(null, false, req.flash('message', 'Contraseña incorrecta, tienes 1 intento más o tu usuario será bloqueado.'));
                    await pool.query('UPDATE users set intentos = "2" WHERE username = ?', [username]);            
                    
                                    
                    const actividad_realizada = "2 intentos fallidos al ingresar";
                    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
                    if (ip.includes('::ffff:')) {
                        ip = ip.split(':').reverse()[0]
                    }
                    console.log(ip);
                    const actividad = {
                        actividad_realizada,
                        ip,
                        user_id: user.id
                    };
                    await pool.query('INSERT INTO actividad set ?', [actividad]);


                }if(user.intentos == 2){
                    done(null, false, req.flash('message', 'Contraseña incorrecta, lo sentimos, por seguridad tu usuario ha sido bloqueado, contacta al administrador.'));
                    await pool.query('UPDATE users set intentos = "3" WHERE username = ?', [username]);            
                    await pool.query('UPDATE users set reportado = "bloqueado" WHERE username = ?', [username]); 
                    
                                    
                    const actividad_realizada = "3 intentos fallidos al ingresar, fue bloqueado";
                    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
                    if (ip.includes('::ffff:')) {
                        ip = ip.split(':').reverse()[0]
                    }
                    console.log(ip);
                    const actividad = {
                        actividad_realizada,
                        ip,
                        user_id: user.id
                    };
                    await pool.query('INSERT INTO actividad set ?', [actividad]);


                }
            }
        }
    } else{
        return done(null, false, req.flash('message', 'El usuario no existe'));
        
    }
}));

passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const { nombre, apellidos} = req.body;
    const tipo_usuario = "comprador";
    const reportado = "activo";
    const intentos = "0";
    const newUser = {
        username,
        password,
        nombre,
        apellidos,
        tipo_usuario,
        reportado,
        intentos
    };
    
    const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0){
        return done(null, false, req.flash('message', 'Use un correo electrónico no registrado'));
    } else{
        newUser.password = await helpers.encryptPassword(password);
    
        const result = await pool.query('INSERT INTO users SET ?', [newUser]);

        newUser.id = result.insertId;


        const actividad_realizada = "Creó su cuenta";
        var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
        if (ip.includes('::ffff:')) {
            ip = ip.split(':').reverse()[0]
        }
        console.log(ip);
        const actividad = {
            actividad_realizada,
            ip,
            user_id: newUser.id
        };
        await pool.query('INSERT INTO actividad set ?', [actividad]);


        return done(null, newUser);        
    }

}));


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM users where id = ?', [id]);
    done(null, rows[0]);
});