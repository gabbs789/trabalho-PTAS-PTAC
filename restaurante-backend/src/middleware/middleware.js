const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ erro: 'Token não enviado' });
  const [bearer, token] = auth.split(' ');
  if (bearer !== 'Bearer' || !token) return res.status(401).json({ erro: 'Token inválido' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo');
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};
