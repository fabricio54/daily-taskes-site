// importando mongoose
const mongoose = require('mongoose');
// definindo uma constante para utilizar a schema do mongoose
const Schema = mongoose.Schema

// definindo o Schema de usuário
const Usuario = new Schema({
    nome: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    eAdmin: {
        type: Number,
        default: 0
    },

    senha: {
        type: String,
        required: true
    }
})

// definindo um modelo que será chamado de usuários
mongoose.model("usuarios", Usuario);