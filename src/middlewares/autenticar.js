// estruturando o sistema de autenticação

// importando o modulo de autenticação
const localStrategy = require("passport-local").Strategy;

// importando o mongoose
const mongoose = require("mongoose");

// importando modulo brcrypt (encriptar senha)
const bcrypt = require("bcryptjs");

// model de usuário
require("../models/Usuario");

// modelo
const Usuario = mongoose.model("usuarios");

module.exports = function(passport) {
    passport.use(new localStrategy({
        usernameField: 'email', passwordField: 'senha'
    }, (email, passport, done) => {
        Usuario.findOne({ email: email }).then((user) => {
            if(!user) {
                return done(null, false, {
                    message: "Essa conta não existe"
                })
            }

            bcrypt.compare(passport, user.senha, (error, equalPassword) => {
                if(equalPassword) {
                    return done(null, user)
                } else {
                    return done(null, false, { message: "senha incorreta "})
                }
            })
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        Usuario.findById(id).then(user => {
            done(null, user)
        }).catch((err) => {
            done(err)
        })
    })
}