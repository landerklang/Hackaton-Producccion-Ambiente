const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    producerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producer',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: mongoose.Schema.Types.Mixed,
      default: 'Consultar',
    },
    imageUrl: String,
    tags: [String],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
