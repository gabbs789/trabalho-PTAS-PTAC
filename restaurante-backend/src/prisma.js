const { PrismaClient } = require('@prisma/client');
require('./config'); 

const prisma = new PrismaClient();

module.exports = prisma;