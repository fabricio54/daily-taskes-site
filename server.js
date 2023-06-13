const app = require('./app')
const connectDatabase = require('./src/database/conect')

connectDatabase();

const port = 3000;
const server = app.listen(port, () => {
  if (!module.parent) {
    console.log('Servidor Rodando na porta 3000');
  }
});

module.exports = server;
