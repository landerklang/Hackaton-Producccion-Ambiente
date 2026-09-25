const express = require('express');
const { createProduct, listProducts } = require('./productController');

const router = express.Router();

router.post('/', createProduct);
router.get('/', listProducts);

module.exports = router;
