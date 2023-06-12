module.exports = {
    eadmin: function(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }

        req.flash("error_msg", "Para entrar na página você deve estar logado");
        res.redirect("/")
    }
}