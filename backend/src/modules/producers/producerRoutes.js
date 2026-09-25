const express = require('express');
const {
  createProducer,
  listProducers,
  getProducerById,
  updateProducer,
} = require('./producerController');

const router = express.Router();

router.post('/', createProducer);
router.get('/', listProducers);
router.get('/:id', getProducerById);
router.put('/:id', updateProducer);

module.exports = router;
