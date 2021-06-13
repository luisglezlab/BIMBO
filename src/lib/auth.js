module.exports = {
    isLoggedIn(req, res, next){
        if (req.isAuthenticated()){
            return next();
        }
        return res.redirect('/signin');
    },

    isNotLoggedIn(req, res, next){
        if (!req.isAuthenticated()){
            return next();
        }
        return res.redirect('/inicio');
    },

    bloqueado(req, res, next){
        if (req.user.reportado == "bloqueado"){
            return res.redirect('/bloqueado');
        }
        return next();
    },

    nobloqueado(req, res, next){
        if (req.user.reportado != "bloqueado"){
            return res.redirect('/inicio');
        }
        return next();
    },

    administrador(req, res, next){
        if (req.user.tipo_usuario == "comprador"){
            return res.redirect('/inicio');
        }
        return next();
    },
    
    cliente(req, res, next){
        if (req.user.tipo_usuario != "comprador"){
            return res.redirect('/productos');
        }
        return next();
    }
};