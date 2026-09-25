const mongoose = require('mongoose');

const producerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    profileText: {
      type: String,
      trim: true,
    },
    whatsappNumber: String,
    instagram: String,
    addressText: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

producerSchema.index({ location: '2dsphere' });
producerSchema.index({ category: 1, status: 1 });
producerSchema.index({ name: 'text', description: 'text' });
producerSchema.index(
  { ownerUserId: 1 },
  { unique: true, partialFilterExpression: { ownerUserId: { $type: 'objectId' } } },
);

module.exports = mongoose.model('Producer', producerSchema);
