const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ mensagem: 'Token ausente', erro: true });

  const parts = authHeader.split(' ');
  if (parts.length !== 2)
    return res.status(401).json({ mensagem: 'Token inválido', erro: true });

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme))
    return res.status(401).json({ mensagem: 'Token malformatado', erro: true });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ mensagem: 'Token inválido', erro: true });
  }
};
