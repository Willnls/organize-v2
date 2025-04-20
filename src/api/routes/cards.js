// src/api/routes/cards.js
const express = require('express');
const router = express.Router();
const cardsController = require('../controllers/cardsController');

router.get('/cards', cardsController.getCards);
router.post('/cards', cardsController.createCard);
router.put('/cards/:id', cardsController.updateCard);
router.delete('/cards/:id', cardsController.deleteCard);

module.exports = router;