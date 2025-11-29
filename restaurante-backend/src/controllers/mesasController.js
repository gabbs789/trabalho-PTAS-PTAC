const prisma = require('../prisma');


exports.criar = async (req, res) => {
  try {
    
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: true, mensagem: 'Token não enviado' });

    const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!usuario || !usuario.isAdmin) return res.status(403).json({ erro: true, mensagem: 'Acesso negado' });

    const { codigo, n_lugares } = req.body;
    if (!codigo || !n_lugares || Number.isNaN(Number(n_lugares))) {
      return res.status(400).json({ erro: true, mensagem: 'Informe codigo (string) e n_lugares (numero)' });
    }

    const existente = await prisma.mesa.findUnique({ where: { codigo } });
    if (existente) return res.status(409).json({ erro: true, mensagem: 'Mesa com este codigo já existe' });

    const mesa = await prisma.mesa.create({ data: { codigo, n_lugares: Number(n_lugares) } });
    return res.status(201).json({ erro: false, data: mesa });
  } catch (e) {
    return res.status(500).json({ erro: true, mensagem: 'Erro ao criar mesa', detalhe: e.message });
  }
};


exports.listar = async (req, res) => {
  try {
    const { n_lugares, codigo } = req.query;
    const where = {};
    if (codigo) where.codigo = String(codigo);
    if (n_lugares) where.n_lugares = { gte: Number(n_lugares) };

    const mesas = await prisma.mesa.findMany({ where, orderBy: { id: 'asc' } });
    return res.json({ erro: false, data: mesas });
  } catch (e) {
    return res.status(500).json({ erro: true, mensagem: 'Erro ao listar mesas', detalhe: e.message });
  }
};


exports.disponibilidade = async (req, res) => {
  try {
    const { data, n_pessoas } = req.query;
    if (!data) return res.status(400).json({ erro: true, mensagem: 'Informe data (ISO)' });

    const dt = new Date(data);
    if (isNaN(dt.getTime())) return res.status(400).json({ erro: true, mensagem: 'Data inválida' });

    const capacidadeFiltro = n_pessoas ? { gte: Number(n_pessoas) } : undefined;

  
    const ocupadas = await prisma.reserva.findMany({
      where: { data: dt },
      select: { mesaId: true }
    });
    const ocupadasIds = new Set(ocupadas.map((r) => r.mesaId));

   
    const elegiveis = await prisma.mesa.findMany({
      where: {
        ...(capacidadeFiltro ? { n_lugares: capacidadeFiltro } : {})
      },
      orderBy: { id: 'asc' }
    });

    const disponiveis = elegiveis.filter((m) => !ocupadasIds.has(m.id));
    return res.json({ erro: false, total: disponiveis.length, data: disponiveis });
  } catch (e) {
    return res.status(500).json({ erro: true, mensagem: 'Erro ao verificar disponibilidade', detalhe: e.message });
  }
};
