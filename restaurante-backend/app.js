const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


const authRoutes = require('../src/routes/authRoutes');
app.use('/auth', authRoutes);

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
