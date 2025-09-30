# Restaurante - Backend (Parte 1)

API para autenticação de usuário utilizando Node.js, Express e Prisma (Arquitetura MVC).

## Estrutura (MVC)
- src/
  - app.js (configuração do Express)
  - index.js (bootstrap do servidor)
  - controllers/
    - authController.js (cadastro, login, perfil)
  - middleware/
    - middleware.js (autenticação JWT)
  - routes/
    - routes.js (rotas de autenticação e perfil)
  - config.js (carrega .env ou .env.test)
  - prisma.js (instância PrismaClient)
- prisma/
  - schema.prisma (Model Usuario)
  - seed.js (cria usuário admin)

## Requisitos
- Node 18+
- SQLite (embutido via Prisma)

## Configuração
1. Instalar dependências
```bash
cd restaurante-backend
npm install
```
2. Configurar banco e gerar schema
```bash
npm run db:push
npm run seed
```

## Executar
```bash
npm run dev
# ou
npm start
```
Servidor: http://localhost:4000

## Testes
```bash
npm test
```

## Rotas
- POST /auth/cadastro
  - body: { nome, email, password }
  - resp: { mensagem, erro, token? }
- POST /auth/login
  - body: { email, password }
  - resp: { mensagem, erro, token? }
- GET /auth/profile (bearer token)
- PUT /auth/profile (bearer token)

## Demonstração rápida (curl)
- Cadastro:
```bash
curl -X POST http://localhost:4000/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{"nome":"Cliente","email":"cliente@example.com","password":"123456"}'
```
- Login:
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@example.com","password":"123456"}'
```
- Perfil (substitua TOKEN):
```bash
curl http://localhost:4000/auth/profile -H "Authorization: Bearer TOKEN"
```

## Observações
- Para apresentação PTAS/PTAC: utilize o front-end (PTAC) ou Postman/curl.
- Há usuário admin seedado: email admin@restaurante.com, senha admin123.
