// baixando todos os modulos que vamos utilizar
//
// express
const express = require("express");

// rotas
const router = express.Router();

// mongoose (banco de dados)
const mongoose = require("mongoose");

// carregando os modelos do banco de dados
    // Tarefa
        require("../models/Tarefa");
    // Usuário
        require("../models/Usuario");
    // constante atribuidos a eles
        const Tarefa = mongoose.model("tarefas");
        const Usuario = mongoose.model("usuarios");

// help (importa a função que autentica o usuário)
const {eadmin} = require("../helper/eadmin");

// ROTAS (api)

// ROTAS GET (carrega página)

    // pagina principal site
    router.get("/", eadmin, (req, res) => {
        // carrega página principal e recebe um id como parâmetro
        res.render("admin/index", {id: req.params.id});
    })

    // pagina principal
    router.get("/index", eadmin, (req, res) => {
        res.render("admin/index");
    })

    // pagina tarefas
    router.get("/tarefas/:email", eadmin, async(req, res) => {
        // listar todas as tarefas que usuário criou
        const usuarios = await Tarefa.find({email: req.params.email});

        if(usuarios) {
            console.log(usuarios)
            res.render("admin/tarefas", {usuarios: usuarios});
        }else {
            // exibe uma mensagem de error ao não encontrar e redireciona a tela principal
            req.flash("error_msg", "Houve um erro interno ao listar tarefas");
            res.redirect("/admin");
        }
    })

    // carregando pagina de tarefas concluidas
    router.get("/tarefas/concluida/:id/:email", eadmin, async(req, res) => {
            // usuario
            const usuario = await Tarefa.findOne({_id: req.params.id});

            if(usuario) {
                usuario.status = "Concluido";
                const salvar = await usuario.save();
                if(salvar) {
                    req.flash("success_msg", "Tarefa concluida com sucesso");
                    res.redirect(`/admin/tarefas/${usuario.email}`);
                }else{
                    req.flash("error_msg", "Erro ao concluir tarefa");
                    res.redirect(`/admin/categorias/${usuario.email}`);
                }
            }else {
                req.flash("error_msg", "Erro ao concluir tarefa");
                res.redirect(`/admin/tarefas/${req.params.email}`);
            }
        
    })

    // rota da página de exclussão de tarefas
    router.get("/tarefas/excluir/:id/:email", eadmin, async (req, res) => {

        const tarefa = await Tarefa.deleteOne({_id: req.params.id});
        if(tarefa) {
            req.flash("success_msg", "Tarefa apagada com sucesso");
            res.redirect(`/admin/tarefas/${req.params.email}`);
        }else {
            req.flash("error_msg", "Erro interno ao apagar tarefa");
            res.redirect(`/admin/tarefas/${req.params.email}`);
        }
    })

    // pagina de edição de perfil
    router.get("/edit/perfil/:id", eadmin, async (req, res) => {
        const usuario = await Usuario.findById({_id: req.params.id});
        if (usuario) {
            res.render("admin/editperfil", { usuario: usuario});
        } else {
            req.flash("error_msg", "Erro interno ao editar perfil");
            res.redirect("/admin/index");
        }

    })

    // pagina de exclussão de tarefas
    router.get("/tarefas/edit/:id/:email", eadmin, async(req, res) => {
        Tarefa.findOne({_id:req.params.id}).then((tarefa) => {
            res.render("admin/edittarefas", {tarefa: tarefa});
        }).catch((error) => {
            req.flash("error_msg", "esta tarefa não existe");
            res.redirect("/admin/tarefas/"+req.params.email)
        })
    })

    router.get("/tarefas/pontos/:email", eadmin, async(req, res) => {
        try {
            const totTarefas = await Tarefa.find({email: req.params.email}).count();

            const totalConcluido = await Tarefa.find({email: req.params.email, status: "Concluido"}).count();

            res.render("admin/pontos", { tarefas: totTarefas, totalConcluido: totalConcluido, pontos: totalConcluido * 10});

        } catch (error) {
            req.flash("error_msg", "Erro ao carregar pagina de pontos");
            res.redirect(`/admin`);
        }
    })

    router.get("/tarefas/add/:id", eadmin, (req, res) => {
        res.render("admin/addtarefas");
    })



// ROTAS POST (recebe requisição do usuarios)

    // Editando tarefa
    router.post("/tarefas/nova", eadmin, async (req, res) => {
        let erros = [];

        if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null){
            erros.push({text: "Nome Inválido"});
        }

        if(!req.body.descricao || typeof req.body.descricao === undefined || req.body.descricao === null) {
            erros.push({text: "Descrição inválido"})
        }

        if(!req.body.prazo || typeof req.body.prazo === undefined || req.body.prazo === null) {
            erros.push({text: "Data inválida"})
        }

        if(erros.length > 0) {
            res.render("admin/addtarefas", {
                erros: erros
            })
        }

        else {
            const novaTarefa = {
                nome: req.body.nome,
                email: req.body.email,
                descricao: req.body.descricao,
                data: req.body.prazo,
                status: "Pendente"
            }

            if(Tarefa(novaTarefa).save()) {
                req.flash("success_msg", "tarefa criada com sucesso!");
                res.redirect(`/admin/tarefas/${req.body.email}`);
            }else {
                req.flash("error_msg", "Houve um ao salvar tarefa, tente novamente!");
                res.redirect("/admin");
            }

        }
    })

    // rota de edição de tarefa
    router.post("/tarefas/edit/:email", eadmin, async(req, res) => {
        let erros = [];

        if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null){
            erros.push({text: "Nome Inválido"})
        }

        if(!req.body.descricao || typeof req.body.descricao === undefined || req.body.descricao === null) {
            erros.push({text: "Descrição inválida"})
        }

        if(!req.body.prazo || typeof req.body.prazo === undefined || req.body.prazo === null) {
            erros.push({text: "Data inválida"})
        }

        if(erros.length > 0) {
            res.render("admin/addtarefas", {
            erros: erros
            })
        } 
        else {
            const usuario = await Tarefa.findOne({_id: req.body.id});

            if(usuario) {
                usuario.nome = req.body.nome;
                usuario.descricao = req.body.descricao;
                usuario.data = req.body.prazo;

                if(usuario.save()) {
                    req.flash("success_msg", "Tarefa editada com sucesso");
                    res.redirect(`/admin/tarefas/${req.params.email}`);
                }else {
                    req.flash("error_msg", "Erro ao editar tarefa");
                    res.redirect(`/admin/tarefas/${req.body.id}/${req.params.email}`);
                }
            }else {
                req.flash("error_msg", "Erro interno ao salvar tarefas");
                res.redirect(`admin/tarefas/edit/${req.body.id}/${req.params.email}`);
            }
        }
    })

    // editando tarefa
    router.post("/tarefas/edit/perfil/:id", eadmin, async(req, res) =>{
        let erros = []

        if(!req.body.nome || req.body.nome === null || typeof req.body.nome === undefined) {
            erros.push({text: "Nome inválido"})
        }

        if(!req.body.email || req.body.email === null || typeof req.body.email === undefined) {
            erros.push({text: "E-mail inválido"})
        }

        if(erros.length > 0) {
            res.render("usuarios/usuario", {erros: erros})
        }else {

            Usuario.findById({_id: req.params.id}).then((perfil) => {
                perfil.nome = req.body.nome
                perfil.email = req.body.email
                perfil.save().then(() => {
                    req.flash("success_msg", "perfil alterado com successo")
                    res.redirect("/admin/index")
                    }).catch(() => {
                        req.flash("error_msg", "Erro ao salvar perfil")
                        res.redirect('/admin/editperfil')
                    })
            }).catch(() => {
                req.flash("error_msg", "Erro ao salvar alterações")
                res.redirect("/admin/editperfil")
                })
   
            }
    })

// exportando o router
module.exports = router;