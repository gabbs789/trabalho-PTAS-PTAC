const path = require('path');


process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'segredo_de_teste';
process.env.DATABASE_URL = process.env.DATABASE_URL || `file:${path.join(__dirname, '..', 'prisma', 'test.db').replace(/\\/g, '/')}`;

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require(path.join(__dirname, '..', 'src', 'app.js'));
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const model = prisma.usuario;


const cp = require('child_process');
beforeAll(() => {
  const env = { ...process.env, DATABASE_URL: process.env.DATABASE_URL };
  cp.execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env
  });
});

beforeAll(async () => {
  await model.deleteMany({});
  await model.create({
    data: {
      nome: 'Teste',
      email: 'teste@example.com',
      password: await bcrypt.hash('123456', 10),
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Testes de Login', () => {
  it('Deve logar com sucesso com credenciais válidas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'teste@example.com', password: '123456' });

    expect([200, 201]).toContain(res.statusCode);
    expect(res.body.erro).toBe(false);
    expect(res.body.token).toBeDefined();
  });

  it('Deve falhar ao logar com email inexistente', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'naoexiste@example.com', password: '123456' });

    expect([400, 401, 404]).toContain(res.statusCode);
    expect(res.body.erro).toBe(true);
  });

  it('Deve falhar ao logar com senha incorreta', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'teste@example.com', password: 'senhaerrada' });

    expect([400, 401]).toContain(res.statusCode);
    expect(res.body.erro).toBe(true);
  });
});



describe('Testes de Cadastro', () => {
  it('Deve cadastrar com sucesso com dados válidos', async () => {
    const email = `novo_${Date.now()}@example.com`;

    const res = await request(app)
      .post('/auth/cadastro')
      .send({ nome: 'Novo', email, password: '123456' });

    expect([200, 201]).toContain(res.statusCode);
    expect(res.body.erro).toBe(false);
    expect(res.body.token).toBeDefined();
  });

  it('Deve falhar ao cadastrar com campos incompletos', async () => {
    const res = await request(app)
      .post('/auth/cadastro')
      .send({ nome: 'Incompleto', email: 'incompleto@example.com' }); 

    expect(res.statusCode).toBe(400);
    expect(res.body.erro).toBe(true);
  });

  it('Deve falhar ao cadastrar com email duplicado', async () => {
    const email = `dup_${Date.now()}@example.com`;

    const res1 = await request(app)
      .post('/auth/cadastro')
      .send({ nome: 'Dup', email, password: '123456' });

    expect([200, 201]).toContain(res1.statusCode);

    const res2 = await request(app)
      .post('/auth/cadastro')
      .send({ nome: 'Dup2', email, password: '123456' });

    expect([409, 400]).toContain(res2.statusCode);
    expect(res2.body.erro).toBe(true);
  });
});