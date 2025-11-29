const prisma = require('../prisma');

// Criar reserva: body { data: 'YYYY-MM-DD', n_pessoas, mesaId }
exports.criar = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: true, mensagem: 'Token não enviado' });

    const { data, n_pessoas, mesaId } = req.body;
    if (!data || !n_pessoas || !mesaId) return res.status(400).json({ erro: true, mensagem: 'Campos obrigatórios: data, n_pessoas, mesaId' });

    const dt = new Date(data + 'T00:00:00.000Z');
    if (isNaN(dt.getTime())) return res.status(400).json({ erro: true, mensagem: 'Data inválida' });

    // só hoje ou futuro
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (dt < hoje) return res.status(400).json({ erro: true, mensagem: 'Data deve ser hoje ou futura' });

    // mesa existe?
    const mesa = await prisma.mesa.findUnique({ where: { id: Number(mesaId) } });
    if (!mesa) return res.status(404).json({ erro: true, mensagem: 'Mesa não encontrada' });
    if (Number(n_pessoas) > mesa.n_lugares) return res.status(400).json({ erro: true, mensagem: 'Número de pessoas maior que capacidade da mesa' });

    // Verifica disponibilidade (mesma data exata)
    const ocupada = await prisma.reserva.findUnique({ where: { data_mesaId: { data: dt, mesaId: Number(mesaId) } } }).catch(() => null);
    if (ocupada) return res.status(409).json({ erro: true, mensagem: 'Mesa já reservada para essa data' });

    const reserva = await prisma.reserva.create({
      data: { data: dt, n_pessoas: Number(n_pessoas), mesaId: Number(mesaId), usuarioId: userId }
    });

    return res.status(201).json({ erro: false, data: reserva });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: true, mensagem: 'Erro ao criar reserva', detalhe: e.message });
  }
};

// Retorna apenas minhas reservas (com dados da mesa)
exports.minhas = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: true, mensagem: 'Token não enviado' });

    const reservas = await prisma.reserva.findMany({ where: { usuarioId: userId }, include: { mesa: true }, orderBy: { data: 'asc' } });
    return res.json({ erro: false, total: reservas.length, data: reservas });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: true, mensagem: 'Erro ao buscar reservas', detalhe: e.message });
  }
};

// Deletar reserva (apenas dono) - body { reservaId }
exports.deletar = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: true, mensagem: 'Token não enviado' });

    const { reservaId } = req.body;
    if (!reservaId) return res.status(400).json({ erro: true, mensagem: 'reservaId obrigatório' });

    const reserva = await prisma.reserva.findUnique({ where: { id: Number(reservaId) } });
    if (!reserva) return res.status(404).json({ erro: true, mensagem: 'Reserva não encontrada' });
    if (reserva.usuarioId !== userId) return res.status(403).json({ erro: true, mensagem: 'Acesso negado: não é dono da reserva' });

    // só pode cancelar hoje ou futuro
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const resDate = new Date(reserva.data);
    resDate.setHours(0, 0, 0, 0);
    if (resDate < hoje) return res.status(400).json({ erro: true, mensagem: 'Só é possível cancelar reservas de hoje ou futuras' });

    await prisma.reserva.delete({ where: { id: Number(reservaId) } });
    return res.json({ erro: false, mensagem: 'Reserva cancelada' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: true, mensagem: 'Erro ao cancelar reserva', detalhe: e.message });
  }
};

// GET /reservas/list (admin) -> query: ?data=YYYY-MM-DD
exports.listarPorData = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: true, mensagem: 'Token não enviado' });

    const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!usuario || !usuario.isAdmin) return res.status(403).json({ erro: true, mensagem: 'Acesso negado' });

    const { data } = req.query;
    const where = {};
    if (data) {
      const start = new Date(data + 'T00:00:00.000Z');
      const end = new Date(data + 'T23:59:59.999Z');
      where.data = { gte: start, lte: end };
    }

    const reservas = await prisma.reserva.findMany({ where, include: { mesa: true, usuario: true }, orderBy: { data: 'asc' } });
    return res.json({ erro: false, total: reservas.length, data: reservas });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: true, mensagem: 'Erro ao listar reservas', detalhe: e.message });
  }
};
