const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cardRoutes = require('./api/routes/cards');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Ajustado para pasta public

// Rotas
app.use('/api', cardRoutes);

// Servir index.html
app.get('/', (req, res) => {
    res.sendFile('src/client/pages/index.html', { root: __dirname });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));