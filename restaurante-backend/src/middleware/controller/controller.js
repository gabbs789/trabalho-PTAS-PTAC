// src/middleware/controller/controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Model conforme seu schema.prisma (model Usuario { ... } => prisma.usuario)
const model = prisma.usuario;

function generateToken(user) {
  const secret =
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV === 'test' ? 'segredo_de_teste' : null);

  if (!secret) {
    throw new Error('JWT_SECRET não definido no .env');
  }

  return jwt.sign(
    { userId: user.id, nome: user.nome, isAdmin: user.isAdmin },
    secret,
    { expiresIn: '7d' }
  );
}

// POST /auth/cadastro
exports.register = async (req, res) => {
  try {
    const { nome, email, password } = req.body;
    if (!nome || !email || !password) {
      return res.status(400).json({ mensagem: 'Campos incompletos', erro: true });
    }

    const existing = await model.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ mensagem: 'Email já cadastrado', erro: true });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await model.create({
      data: { nome, email, password: hashed }
    });

    const token = generateToken(user);
    return res.status(201).json({
      mensagem: 'Usuário criado com sucesso',
      erro: false,
      token
    });
  } catch (err) {
    // Trata violação de unique do Prisma também
    if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
      return res.status(409).json({ mensagem: 'Email já cadastrado', erro: true });
    }
    console.error(err);
    return res.status(500).json({ mensagem: 'Erro no servidor', erro: true });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ mensagem: 'Campos incompletos', erro: true });
    }

    const user = await model.findUnique({ where: { email } });
    if (!user) {
      // 401 para credenciais inválidas
      return res.status(401).json({ mensagem: 'Usuário não encontrado', erro: true });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ mensagem: 'Senha incorreta', erro: true });
    }

    const token = generateToken(user);
    return res.status(200).json({
      mensagem: 'Login realizado com sucesso',
      erro: false,
      token
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: 'Erro no servidor', erro: true });
  }
};

// GET /auth/profile
exports.profile = async (req, res) => {
  try {
    const user = await model.findUnique({
      where: { id: req.userId },
      select: { id: true, nome: true, email: true, isAdmin: true, createdAt: true }
    });

    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado', erro: true });
    }

    return res.status(200).json({ mensagem: 'Perfil encontrado', erro: false, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: 'Erro no servidor', erro: true });
  }
};

// PUT /auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { nome, email, password } = req.body;
    const data = {};

    if (nome) data.nome = nome;
    if (email) data.email = email;
    if (password) data.password = await bcrypt.hash(password, 10);

    await model.update({ where: { id: req.userId }, data });
    return res.status(200).json({ mensagem: 'Perfil atualizado', erro: false });
  } catch (err) {
    if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
      return res.status(409).json({ mensagem: 'Email já cadastrado', erro: true });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ mensagem: 'Usuário não encontrado', erro: true });
    }
    console.error(err);
    return res.status(500).json({ mensagem: 'Erro ao atualizar', erro: true });
  }
};
