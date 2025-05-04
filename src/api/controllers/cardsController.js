// src/api/controllers/cardsController.js
const { generateId } = require('../utils/generateId');

let cards = []; // Banco de dados em memória

exports.getCards = (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: cards
        });

        // console.log(`[INFO] Cards: ${cards.length}`);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cards'
        });
    }
};

exports.createCard = (req, res) => {
    try {
        const newCard = {
            id: generateId(),
            createdAt: new Date().toISOString(),
            ...req.body
        };

        cards.push(newCard);        
        console.log(`[INFO] Cards: ${JSON.stringify(cards)}`);

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
};

exports.updateCard = (req, res) => {
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
};

exports.deleteCard = (req, res) => {
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
};