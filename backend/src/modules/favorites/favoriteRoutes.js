const express = require('express');
const auth = require('../../middleware/auth');
const { createFavorite, deleteFavorite, listFavorites } = require('./favoriteController');

const router = express.Router();

router.use(auth);
router.get('/', listFavorites);
router.post('/', createFavorite);
router.delete('/:id', deleteFavorite);

module.exports = router;
