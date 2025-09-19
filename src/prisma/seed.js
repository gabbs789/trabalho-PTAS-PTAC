
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  const usuarios = [
    {
      nome: 'Gabriel Dutra',
      email: 'gabriel@example.com',
      password: '123456', 
      isAdmin: true,
    },
    {
      nome: 'João Silva',
      email: 'joao@example.com',
      password: 'senha123',
      isAdmin: false,
    },
    {
      nome: 'Maria Oliveira',
      email: 'maria@example.com',
      password: 'senha123',
      isAdmin: false,
    },
  ];

  for (const user of usuarios) {
    await prisma.usuario.upsert({
      where: { email: user.email },
      update: {}, 
      create: user,
    });
  }

  console.log('Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
