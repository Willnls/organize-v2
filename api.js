const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve arquivos estáticos (incluindo index.html)

// Banco de dados em memória (simulado)
let cards = [
    // {
    //     id: '1',
    //     title: 'Update user interface design',
    //     description: 'Implement new design system across all pages',
    //     status: 'todo',
    //     priority: 'high',
    //     assignee: 'Sarah',
    //     dueDate: '2023-12-01',
    //     createdAt: new Date().toISOString()
    // },
    // {
    //     id: '2',
    //     title: 'API Integration',
    //     description: 'Connect backend APIs with frontend',
    //     status: 'in-progress',
    //     priority: 'medium',
    //     assignee: 'Michael',
    //     dueDate: '2023-12-03',
    //     createdAt: new Date().toISOString()
    // }
];

// Gerador de ID simples
const generateId = () => Math.random().toString(36).substring(2, 9);

// Rota principal serve o index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Rotas para Cards
app.get('/api/cards', (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: cards
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cards'
        });
    }
});

app.post('/api/cards', (req, res) => {
    try {
        const newCard = {
            id: generateId(),
            createdAt: new Date().toISOString(),
            ...req.body
        };

        cards.push(newCard);

        res.status(201).json({
            success: true,
            data: newCard
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to create card'
        });
    }
});

app.put('/api/cards/:id', (req, res) => {
    try {
        const { id } = req.params;
        const cardIndex = cards.findIndex(card => card.id === id);

        if (cardIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Card not found'
            });
        }

        cards[cardIndex] = {
            ...cards[cardIndex],
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        res.status(200).json({
            success: true,
            data: cards[cardIndex]
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to update card'
        });
    }
});

app.delete('/api/cards/:id', (req, res) => {
    try {
        const { id } = req.params;
        const cardIndex = cards.findIndex(card => card.id === id);

        if (cardIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Card not found'
            });
        }

        cards = cards.filter(card => card.id !== id);

        res.status(200).json({
            success: true,
            message: 'Card deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to delete card'
        });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));