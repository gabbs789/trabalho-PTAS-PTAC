const request = require('supertest');
const app = require('../src/app'); 

describe('Testes de Login', () => {
  it('Deve logar com sucesso com credenciais válidas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'teste@example.com',
        password: '123456'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.erro).toBe(false);
    expect(res.body.token).toBeDefined();
  });

  it('Deve falhar ao logar com email inexistente', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'naoexiste@example.com',
        password: '123456'
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.erro).toBe(true);
  });

  it('Deve falhar ao logar com senha incorreta', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'teste@example.com',
        password: 'senhaerrada'
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.erro).toBe(true);
  });
});
