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
npm test
```
## Rotas
- Health e índice
  - GET /health
  - GET /
- Autenticação
  - POST /cadastro (atalho)
  - POST /login (atalho)
  - POST /auth/cadastro

## Mesas
- POST /mesas/novo (admin + bearer token)
  - body: { codigo, n_lugares }
- GET /mesas
- GET /mesas/disponibilidade?data=YYYY-MM-DD

## Reservas
- POST /reservas/novo (login required)
  - body: { data: 'YYYY-MM-DD', n_pessoas, mesaId }
- POST /reservas (login) — retorna apenas minhas reservas
- DELETE /reservas (login, dono) — body { reservaId }
- GET /reservas/list (login + admin) — opcional query ?data=YYYY-MM-DD
    - body: { nome, email, password }
    - resp: { mensagem, erro, token? }
  - POST /auth/login
    - body: { email, password }
    - resp: { mensagem, erro, token? }
- Mesas
  - POST /mesas/novo
    - body: { codigo: string, n_lugares: number }
  - GET /mesas
    - query (opcional): codigo, n_lugares
  - GET /mesas/disponibilidade
    - query: data=ISODateTime, n_pessoas (opcional)

## Demonstração rápida (curl)
- Health/Índice
```bash
curl http://localhost:4000/health
curl http://localhost:4000/
```
- Cadastro/Login (atalhos):
```bash
curl -X POST http://localhost:4000/cadastro \
  -H "Content-Type: application/json" \
  -d '{"nome":"Cliente","email":"cliente@example.com","password":"123456"}'

curl -X POST http://localhost:4000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@example.com","password":"123456"}'
```
- Mesas:
```bash
# Criar mesa
curl -X POST http://localhost:4000/mesas/novo \
  -H "Content-Type: application/json" \
  -d '{"codigo":"M01","n_lugares":4}'

# Listar mesas
curl http://localhost:4000/mesas

# Listar mesas com filtro de lugares >= 4
curl "http://localhost:4000/mesas?n_lugares=4"

# Disponibilidade em data específica
curl "http://localhost:4000/mesas/disponibilidade?data=2025-11-30T19:00:00.000Z&n_pessoas=4"
```

## Observações
- Para apresentação PTAS/PTAC: utilize o front-end (PTAC) ou Postman/curl.
- Há usuário admin seedado: email admin@restaurante.com, senha admin123.
