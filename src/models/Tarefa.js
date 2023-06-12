// importando o modulo mongoose
const mongoose = require("mongoose");

// usando as função de schemas do moongose
const Schema = mongoose.Schema;

// definindo um schema
const Tarefa = new Schema({
    nome: {
        type: String,
        required: true
    },

    email: {
        type: String,
        require: true,
    },

    descricao: {
        type: String,
        required: true
    },

    data: {
        type: String,
        required: false
    },

    status: {
        type: String,
        required: true
    }
})

// o nome da collection com o modelo como parâmetros
mongoose.model("tarefas", Tarefa);