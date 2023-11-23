const mongoose = require('mongoose');

async function connectDatabase() {
  console.log("Aguardando conexão com o banco de dados...");
  try {
    await mongoose.connect("mongodb+srv://fabricio:fabricio@cluster0.xv0badm.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Mongo Atlas Connected");
  } catch (error) {
    console.log(error);
  }
}

module.exports = connectDatabase;

