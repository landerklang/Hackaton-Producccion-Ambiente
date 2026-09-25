const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    producerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producer',
      default: null,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
  },
  { timestamps: true }
);

favoriteSchema.index(
  { userId: 1, producerId: 1 },
  { unique: true, partialFilterExpression: { producerId: { $type: 'objectId' } } }
);

favoriteSchema.index(
  { userId: 1, productId: 1 },
  { unique: true, partialFilterExpression: { productId: { $type: 'objectId' } } }
);

module.exports = mongoose.model('Favorite', favoriteSchema);
