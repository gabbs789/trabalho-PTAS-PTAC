const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const gerarToken = (u) => jwt.sign({ userId: u.id }, process.env.JWT_SECRET || 'segredo', { expiresIn: '1d' });

// POST /auth/cadastro
exports.cadastrar = async (req, res) => {
  const { nome, email, password } = req.body;
  if (!nome || !email || !password) return res.status(400).json({ mensagem: 'Dados inválidos', erro: true });

  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) return res.status(409).json({ mensagem: 'Email já cadastrado', erro: true });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.usuario.create({ data: { nome, email, password: hash } });
  return res.status(201).json({ mensagem: 'OK', erro: false, token: gerarToken(user) });
};

// POST /auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ mensagem: 'Dados inválidos', erro: true });

  const user = await prisma.usuario.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ mensagem: 'Credenciais inválidas', erro: true });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ mensagem: 'Credenciais inválidas', erro: true });

  return res.json({ mensagem: 'OK', erro: false, token: gerarToken(user) });
};
