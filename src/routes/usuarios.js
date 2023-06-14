// exportando modulos

    // express
        const express = require("express");
    
    // rotas
        const router = express.Router();
    
    // mongoose
        const mongoose = require("mongoose");

    // exportando modelo usuário
        require("../models/Usuario");

    // usando modelo
        const Usuario = mongoose.model("usuarios");

    // bcrypt (modulo para encriptar a senha)
        const bcrypt = require("bcryptjs");

    // passport (modulo para autenticar usuario)
        const passport = require("passport");


// ROTAS

// ROTAS GET

    // pagina de registro
    router.get("/registro", (req, res) =>{
        res.render("usuarios/usuario");
    })

    // pagina de login
    router.get("/login", (req, res) => {
        res.render("usuarios/login");
    })

    // pagina para sair
    router.get("/logout", (req, res, next) => {
        req.logout(function(err) {
            if (err) { return next(err)}
            res.redirect('/');
        })
    })

    // pagina esqueceu senha
    router.get("/esqueceusenha", (req, res) => {
        res.render("usuarios/esqueceusenha");
    })

// ROTAS POST

    // rota para fazer registro
        router.post("/registro", async(req, res) => {
            let erros = []

            if(!req.body.nome || req.body.nome === null || typeof req.body.nome === undefined) {
            erros.push({text: "Nome inválido"})
            }

            if(!req.body.email || req.body.email === null || typeof req.body.email === undefined) {
            erros.push({text: "E-mail inválido"})
            }

            if(!req.body.senha || req.body.senha === null || typeof req.body.senha === undefined) {
            erros.push({text: "Senha inválido"})
            }

            if(req.body.senha.length < 6 || req.body.senha.length > 12) {
            erros.push({text: "Senha deve ter entre 6 a 12 caracters"})
            }

            if(req.body.senha !== req.body.senha2) {
            erros.push({text: "Senha diferente de confirmar senha"})
            }

            if(erros.length > 0) {
            res.render("usuarios/usuario", {erros: erros})
            }else {
                Usuario.findOne({email: req.body.email}).then((usuario) => {
                    if(usuario){
                        req.flash("error_msg", "Já existe uma conta com este e-mail no sistema")
                        res.redirect("/usuarios/registro")
                    }else{
                        const novoUsuario = new Usuario({
                            nome: req.body.nome,
                            email: req.body.email,
                            senha: req.body.senha
                        })

                        bcrypt.genSalt(10, (erro, salt) => {
                            bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                            if(erro){
                                req.flash("error_msg", "Houve um erro ao salvar usuário")
                                res.redirect("/")
                            }
                            else {
                                novoUsuario.senha = hash

                                novoUsuario.save().then(() => {
                                    req.flash("success_msg", "Usuário Criado com sucesso")
                                    res.redirect("/")
                                }).catch((erro) => {
                                    req.flash("error_msg", "Houve um Erro ao criar usuário")
                                    res.redirect("/usuarios/registro")
                                })
                            }
                        })
                    })
                }
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro interno")
            })
        }
    })

    // autenticação de usuário
    router.post("/login", (req, res, next) => {
        // função para autenticar alguma coisa passando o tipo de autenticação e um objeto com tres informações: caso usuario tenha autenticação ele será redirecionado para uma página, caso ele não tenha autenticação será redirecionado para outra pagina e colocando o failureRedirect igual a true

        passport.authenticate("local", {
            successRedirect: "/admin/index",
            failureRedirect: "/usuarios/login",
            failureFlash: true
        })(req, res, next)
    })

    // pegar email do usuário
    router.post("/esqueceusenha/:email", async(req, res) => {
        const conta = await Usuario.findOne({email: req.body.email});
        console.log(req.body.email)
        if(conta) {
            req.flash("success_msg", "Email existe no sistema");
            res.render("usuarios/senha", { email: req.body.email});
        }else {
            req.flash("error_msg", "Email não existe no sistema");
            res.redirect("/usuarios/esqueceusenha");
        }
    })

    // pegar a senha do usuário
    router.post("/esqueceusenha/email/senha", (req, res) => {
        let erros = []

        if(!req.body.senha || req.body.senha === null || typeof req.body.senha === undefined) {
            erros.push({text: "Senha inválido"})
        }

        if(req.body.senha.length < 6 || req.body.senha.length > 12) {
            erros.push({text: "Senha deve ter entre 6 a 12 caracters"})
        }

        if(req.body.senha !== req.body.confsenha) {
            erros.push({text: "Senha diferente de confirmar senha"})
        }

        if(erros.length > 0) {
            res.render("usuarios/senha", {erros: erros})
        }

        else {
            Usuario.findOne({email: req.body.email}).then((usuario) => {
                
                usuario.senha = req.body.senha

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(usuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash("error_msg", "Houve um erro ao salvar senha")
                            res.redirect("/usuarios/senha")
                        }
                        else {
                            usuario.senha = hash

                            usuario.save().then(() => {
                                req.flash("success_msg", "Senha modificada com sucesso")
                                res.redirect("/usuarios/login")
                            }).catch((erro) => {
                                req.flash("error_msg", "Houve um Erro ao modificar senha")
                                res.redirect("/usuarios/senha")
                            })
                        }
                    })
                })
            })
        }
    })

    module.exports = router;