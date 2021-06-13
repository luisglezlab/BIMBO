const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session');
const passport = require('passport');
const expressip = require('express-ip');

const { database } = require('./keys');

//initialization
const app = express();
require('./lib/passport');

//settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));

app.set('view engine', '.hbs');

//middlewares
app.use(session({
    secret: 'luisito',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(expressip().getIpInfoMiddleware);

  //Global variables
app.use((req, res, next)=>{
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.user = req.user;
    next();
});

//Routes
app.use(require('./routes'));
app.use(require('./routes/authentication'));
app.use('/productos',require('./routes/productos'));
app.use('/cuentas',require('./routes/cuentas'));
app.use('/perfil',require('./routes/perfil'));
app.use('/actividad',require('./routes/actividad'));
app.use('/carrito',require('./routes/carrito'));
app.use('/ventas',require('./routes/ventas'));
app.use('/compras',require('./routes/compras'));


//Public
app.use(express.static(path.join(__dirname, 'public')));

//192.168.0.15

app.get('*', function(req, res){
    res.status(404).render('404');
  });

//Starting server
app.listen(app.get('port'), () =>{
    console.log('Server on port', app.get('port'));
});