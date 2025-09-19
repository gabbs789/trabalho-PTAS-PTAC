
const prisma = require('../prisma'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não definido no .env');
  }

  return jwt.sign(
    { userId: user.id, nome: user.nome, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};


exports.register = async (req, res) => {
  try {
    const { nome, email, password } = req.body;
    if (!nome || !email || !password) {
      return res.status(400).json({ mensagem: 'Campos incompletos', erro: true });
    }

    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ mensagem: 'Email já cadastrado', erro: true });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.usuario.create({
      data: { nome, email, password: hashed }
    });

    const token = generateToken(user);

    return res.status(201).json({ mensagem: 'Usuário criado com sucesso', erro: false, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: 'Erro no servidor', erro: true });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ mensagem: 'Campos incompletos', erro: true });
    }

    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ mensagem: 'Usuário não encontrado', erro: true });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ mensagem: 'Senha incorreta', erro: true });
    }

    const token = generateToken(user);
    return res.json({ mensagem: 'Login realizado com sucesso', erro: false, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: 'Erro no servidor', erro: true });
  }
};


exports.profile = async (req, res) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: req.userId },
      select: { id: true, nome: true, email: true, isAdmin: true, createdAt: true }
    });

    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado', erro: true });
    }

    return res.json({ mensagem: 'Perfil encontrado', erro: false, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: 'Erro no servidor', erro: true });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const { nome, email, password } = req.body;
    const data = {};

    if (nome) data.nome = nome;
    if (email) data.email = email;
    if (password) data.password = await bcrypt.hash(password, 10);

    await prisma.usuario.update({ where: { id: req.userId }, data });
    return res.json({ mensagem: 'Perfil atualizado', erro: false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: 'Erro ao atualizar', erro: true });
  }
};
