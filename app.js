// Carregando modulos da aplicação
    // express
    const express = require('express');
    // handlebars
    const handlebars = require('express-handlebars');
    // bodyParser
    const bodyParser = require('body-parser');
    // mongoose
    const mongoose = require('mongoose');
    // criando uma constante que recebe o a execução do express
    const app = express();
    // criando uma constante com o mesmo no nome do arquivo
    const admin = require('./src/routes/admin');
    // session
    const session = require('express-session');
    // flash
    const flash = require('connect-flash');
    // rota usuarios
    const usuarios = require('./src/routes/usuarios');
    const passport = require("passport")
    require('./src/middlewares/autenticar')(passport)

// configurações
    // sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
    // flash
        app.use(flash())
    // Middleware (registros de variáveis globais)
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash("error_msg");
            res.locals.error = req.flash("error");
            res.locals.user = req.user || null;
            next();
        })
    // body-parse
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
    // Handlebars
        app.engine('handlebars', handlebars.engine({
            defaultLayout: 'main',
            runtimeOptions: {
                allowProtoPropertiesByDefault: true,
                allowProtoPropertiesByDefault:
                true
            },
        }));
        // configuração visualização e o arquivo que é utilizado
        app.set('view engine', 'handlebars');
    // mongoose
        const connectDatabase = () => {
            console.log("wait connecting to the database");
    
            mongoose.connect("mongodb+srv://fabricio:Kpnu8UWH0VorAJcd@cluster0.xv0badm.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true}).then(() => console.log("Mongo Atlas Connected")).catch((error) => console.log(error));
    }

        // executando a conexão
        connectDatabase();
    
    // public
        // midlewares: será o meio termo entre todas as requisições e respostas que averá entre o servidor e o cliente
        app.use((req, res, next) => {
            console.log("Oi eu sou um midleware!");
            next();
        })


// Rotas
    // (Rotas com prefixo)
    // utilizando o método use do app passamos dois parâmetros um prefixo que utilizamos para acessar todas as rotas constante que está o arquivo sendo muito mais prático
    // com isso acessamos o arquivo admin/ (posts/categorias entre outros sendo mais prático)
    app.get('/', (req, res) => {
        res.render("index")
    })
    app.use('/admin', admin);
    app.use("/usuarios", usuarios);

// Outros
const port = 3000;
app.listen(port, () => {
    console.log('Servidor Rodando na porta 3000');
})