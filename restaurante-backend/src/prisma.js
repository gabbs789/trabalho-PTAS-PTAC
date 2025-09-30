const { PrismaClient } = require('@prisma/client');
require('./config'); // Carrega as configurações de ambiente

const prisma = new PrismaClient();

module.exports = prisma;

