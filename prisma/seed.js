const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('admin123', 10);
  await prisma.usuario.upsert({
    where: { email: 'admin@restaurante.com' },
    update: {},
    create: {
      nome: 'Admin',
      email: 'admin@restaurante.com',
      password: hashed,
      isAdmin: true
    }
  });
  console.log('✅ Usuário administrador criado/atualizado');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
