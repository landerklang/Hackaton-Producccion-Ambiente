const express = require('express');
const { generateProducerProfile, generateProductDraft } = require('./aiController');

const router = express.Router();

router.post('/products/ai-generate', generateProductDraft);
router.post('/producers/ai-profile', generateProducerProfile);

module.exports = router;
