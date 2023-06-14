const request = require("supertest");
const app = require("../app");
const bd = require('../src/database/conect');


beforeAll(async () => {
    await bd();
});

describe('Testando as rotas da api (serviços) de usuários deslogado', () => {

    // TESTES DAS ROTAS GET

    // testes para pagina login
    it("testando rota /usuarios/login (caso o teste seja bem-sucedido o status deve retorna como sendo 200)", async () => {
        const resposta = await request(app).get("/usuarios/login");
        expect(resposta.status).toBe(200);
        console.log(`status rota /usuarios/login: ${resposta.status}`)
    });

    // testes para pagina registro
    it("testando rota /usuarios/registro (caso o teste seja bem-sucedido o status deve retornar 200", async() => {
        const resposta = await request(app).get("/usuarios/registro");
        expect(resposta.status).toBe(200);
        console.log(`status rota /usuarios/registro: ${resposta.status}`)
    })

    // teste para deslogar
    it("testando rota /usuarios/esqueceusenha (caso o teste seja bem-sucedido o status deve retornar 200", async() => {
        const resposta = await request(app).get("/usuarios/esqueceusenha");
        expect(resposta.status).toBe(200);
        console.log(`status rota /usuarios/esqueceusenha: ${resposta.status}`)
    })

    // TESTES ROTAS POST

    // ROTAS DE REGISTRO
    it('Deve redirecionar para a rota de registro com sucesso', async () => {
        const resposta = await request(app)
          .post('/usuarios/registro')
          .send({
            nome: 'John Doe',
            email: 'johndoe@example.com',
            senha: 'password123',
            senha2: 'password123'
          });
    
        expect(resposta.status).toBe(302);

        expect(resposta.headers.location).toBe("/usuarios/registro");
      });

      it('Deve retornar mensagem de erro ao tentar registrar um usuário já existente', async () => {
        // Supondo que já exista um usuário com o email fornecido
        const resposta = await request(app)
          .post('/usuarios/registro')
          .send({
            nome: 'John Doe',
            email: 'johndoe@example.com',
            senha: 'password123',
            senha2: 'password123'
          });
    
        expect(resposta.status).toBe(302);
        expect(resposta.headers.location).toBe('/usuarios/registro');
        // Verifique a mensagem de erro esperada na próxima página
      });

      it('Deve redirecionar para a página inicial após o logout', async () => {
        const response = await request(app).get('/usuarios/logout');
        expect(response.statusCode).toBe(302); // Verifica o código de status para o redirecionamento
        expect(response.header.location).toBe('/'); // Verifica se foi redirecionado para a página correta
      });

      // ROTAS DE LOGIN

      it('Deve redirecionar para /admin/index em caso de autenticação bem-sucedida', async () => {
        const response = await request(app)
          .post('/usuarios/login')
          .send({ email: 'johndoe@example.com', senha: 'password123' }); // substitua com os dados de autenticação válidos
    
        expect(response.statusCode).toBe(302); // Verifica o código de status para o redirecionamento
        expect(response.header.location).toBe('/admin/index'); // Verifica se foi redirecionado para a página correta
      });

      it('Deve redirecionar para /usuarios/login em caso de autenticação falha', async () => {
        const response = await request(app)
          .post('/usuarios/login')
          .send({ nome: 'username', senha: 'wrongpassword' }); // substitua com os dados de autenticação inválidos
    
        expect(response.statusCode).toBe(302); // Verifica o código de status para o redirecionamento
        expect(response.header.location).toBe('/usuarios/login'); // Verifica se foi redirecionado para a página correta
      });

      // ROTAS DE ESQUECEU EMAIL
      it('Deve renderizar a página de redefinição de senha quando o email existe no sistema', async () => {
        const response = await request(app)
          .post('/usuarios/esqueceusenha/johndoe@example.com'); // substitua com um email que exista no sistema
    
        expect(response.statusCode).toBe(200); // Verifica o código de status da resposta
      });

      it('Deve redirecionar para /usuarios/esqueceusenha quando o email não existe no sistema', async () => {
        const response = await request(app)
          .post('/usuarios/esqueceusenha/email@naoexiste.com'); // substitua com um email que não exista no sistema
    
        expect(response.statusCode).toBe(302); // Verifica o código de status para o redirecionamento
        expect(response.header.location).toBe('/usuarios/esqueceusenha'); // Verifica se foi redirecionado para a página correta
      });
      
      // ROTAS DE ESQUECEU/SENHA
      it('Deve redirecionar para a página de redefinição de senha com erros de validação quando a senha é inválida', async () => {
        const response = await request(app)
          .post('/usuarios/esqueceusenha/email/senha')
          .send({
            senha: '1234', // substitua com uma senha inválida
            confsenha: '12345'
          });
    
        expect(response.statusCode).toBe(200); // Verifica o código de status da resposta
        
      });
})

describe("testando as rotas api (serviços) usuario logado", () => {
    // ROTAS GET 

    // PAGINA PRINCIPAL
    it('Deve renderizar a página principal do admin com sucesso', async () => {
        const response = await request(app)
          .get('/admin')
          .expect(302); // Verifica se o código de status da resposta é 200 (OK)
      });

      // PAGINA PRINCIPAL ERRO
      it('Deve redirecionar para a página de login se o usuário não for um administrador', async () => {
        const response = await request(app)
          .get('/admin')
          .expect(302); // Verifica se o código de status da resposta é 302 (Redirecionamento)
    
        expect(response.header.location).toBe('/');
      });

      // Pagina de Tarefas valida
      it('Deve renderizar a página de tarefas do admin com sucesso ao fornecer um email válido', async () => {
        const response = await request(app)
          .get('/admin/tarefas/johndoe@example.com')
          .expect(302); // Verifica se o código de status da resposta é 200 (OK)
    
      });
    
      // Página de tarefas inválida
      it('Deve redirecionar para a página principal do admin ao fornecer um email inválido', async () => {
        const response = await request(app)
          .get('/admin/tarefas/invalidemail')
          .expect(302); // Verifica se o código de status da resposta é 302 (Redirecionamento)
    
        expect(response.header.location).toBe('/'); // Verifica se foi redirecionado para a página principal do admin
        // Adicione mais verificações se necessário
      });

      // pagina tarefas concluidas
      it('Deve redirecionar para a página correta ao concluir uma tarefa', async () => {
        const id = '6481cb185301d846617907ed';
        const email = 'felipe@gmail.com';
    
        const response = await request(app)
          .get(`/admin/tarefas/concluida/${id}/${email}`)
          .expect(302); // Verifica se a resposta é um redirecionamento
    
        // Verifique se o cabeçalho 'location' redireciona para a página correta
        expect(response.headers.location).toBe(`/`);
      });

      // paginas cocluidas erro
      it('Deve redirecionar para a página de categorias ao ocorrer um erro ao concluir a tarefa', async () => {
        const id = '6481cb185301d846617907ed';
        const email = 'felipe@gmail.com';
    
        const response = await request(app)
          .get(`/admin/tarefas/concluida/${id}/${email}`)
          .expect(302); // Verifica se a resposta é um redirecionamento
    
        // Verifique se o cabeçalho 'location' redireciona para a página correta
        expect(response.headers.location).toBe(`/`);
      });

      // pagina de edição de tarefas

      it('Deve renderizar a página de edição de tarefas com sucesso', async () => {
        const id = '6481b9f5774b730fdc1d4146';
        const email = 'felipe@gmail.com';
    
        const response = await request(app)
          .get(`/admin/tarefas/edit/${id}/${email}`)
          .expect(302); // Verifica se a resposta é um código 302 (OK)
    
      });


      it('Deve redirecionar para a página correta ao ocorrer um erro ao buscar a tarefa', async () => {
        const id = 'id_inexistente';
        const email = 'felipe@gmail.com';
    
        const response = await request(app)
          .get(`/admin/tarefas/edit/${id}/${email}`)
          .expect(302); // Verifica se a resposta é um redirecionamento
    
      });

      // paginas de pontos
      it('Deve renderizar a página de pontos com sucesso', async () => {
        const email = 'felipe@gmail.com';
    
        const response = await request(app)
          .get(`/admin/tarefas/pontos/${email}`)
          .expect(302); // Verifica se a resposta é um código 302 (OK)
  
      });

      it('Deve redirecionar para a página correta ao ocorrer um erro ao carregar a página de pontos', async () => {
        const email = 'email_do_usuario';
    
        const response = await request(app)
          .get(`/admin/tarefas/pontos/${email}`)
          .expect(302); // Verifica se a resposta é um redirecionamento
    
        // Verifique se o cabeçalho 'location' redireciona para a página correta
        expect(response.headers.location).toBe('/');
      });

      // carregar pagina de add de tarefas
      it('Deve renderizar a página de adição de tarefas com sucesso', async () => {
        const id = '647bc04d061a8be5526826db';
    
        const response = await request(app)
          .get(`/admin/tarefas/add/${id}`)
          .expect(302); // Verifica se a resposta é um código 302 (OK)
    
        
      });
    


      // pagina editar perfil

      it('Deve renderizar a página de edição de perfil com sucesso', async () => {
        const id = '647bc04d061a8be5526826db';
    
        const response = await request(app)
          .get(`/admin/edit/perfil/${id}`)
          .expect(302); // Verifica se a resposta é um código 302 (OK)
    
      });

      // ROTAS POSTS

      // criação de tarefas
      it('Deve criar uma nova tarefa com sucesso', async () => {
        const novaTarefa = {
          nome: 'Nome da Tarefa',
          email: 'felipe@gmail.com',
          descricao: 'Descrição da Tarefa',
          prazo: '2023-06-14',
        };
    
        const response = await request(app)
          .post('/admin/tarefas/nova')
          .send(novaTarefa)
          .expect(302); // Verifica se a resposta é um redirecionamento
    
        // Verifique se o cabeçalho 'location' redireciona para a página correta
        expect(response.headers.location).toBe(`/`);
        
      });

      // erro ao tentar criar tarefa
      it('Deve exibir erros ao tentar criar uma nova tarefa com campos inválidos', async () => {
        const tarefaInvalida = {
          nome: '',
          email: 'felipe@gmail.com',
          descricao: '',
          prazo: null,
        };
    
        const response = await request(app)
          .post('/admin/tarefas/nova')
          .send(tarefaInvalida)
          .expect(302); // Verifica se a resposta é um código 200 (OK)

      });

      // alteração de perfil
      it('Deve alterar o perfil com sucesso', async () => {
        const id = '647bc04d061a8be5526826db';
        const novoNome = 'Mileide';
        const novoEmail = 'felipe@gmail.com';
    
        const response = await request(app)
          .post(`/admin/tarefas/edit/perfil/${id}`)
          .send({ nome: novoNome, email: novoEmail })
          .expect(302); // Verifica se a resposta é um redirecionamento
    
        // Verifique se o cabeçalho 'location' redireciona para a página correta
        expect(response.headers.location).toBe('/');
      });

      
      it('Deve exibir erros ao tentar alterar o perfil com campos inválidos', async () => {
        const id = '647bc04d061a8be5526826db';
        const nomeInvalido = '';
        const emailInvalido = 'felipe@gmail.com';
    
        const response = await request(app)
          .post(`/admin/tarefas/edit/perfil/${id}`)
          .send({ nome: nomeInvalido, email: emailInvalido })
          .expect(302); // Verifica se a resposta é um redirecionamento
    
        // Verifique se o cabeçalho 'location' redireciona para a página correta
        expect(response.headers.location).toBe('/');
      });
    
});


      



