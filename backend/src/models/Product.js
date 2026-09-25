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
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: mongoose.Schema.Types.Mixed,
      default: 'Consultar',
    },
    currency: {
      type: String,
      default: 'ARS',
    },
    imageUrl: String,
    tags: [String],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

productSchema.index({ producerId: 1, status: 1 });
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
