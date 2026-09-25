const express = require('express');
const { generateProducerProfile, generateProductDraft, generateEntrepreneurGuide } = require('./aiController');

const router = express.Router();

router.post('/products/ai-generate', generateProductDraft);
router.post('/producers/ai-profile', generateProducerProfile);
router.post('/ai/entrepreneur-guide', generateEntrepreneurGuide);

module.exports = router;
