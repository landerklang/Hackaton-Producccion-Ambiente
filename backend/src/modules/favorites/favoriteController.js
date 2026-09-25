const Favorite = require('../../models/Favorite');

const listFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .populate('producerId', 'name category description status addressText')
      .populate('productId', 'title description price tags status')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(favorites);
  } catch (error) {
    console.error('Favorite listing failed:', error.message);
    return res.status(500).json({ error: 'Unable to list favorites.' });
  }
};

const createFavorite = async (req, res) => {
  try {
    const { producerId, productId } = req.body;

    if (!producerId && !productId) {
      return res.status(400).json({ error: 'At least one of producerId or productId is required.' });
    }

    if (producerId && productId) {
      return res.status(400).json({ error: 'Choose either a producer or a product, not both.' });
    }

    const payload = { userId: req.user._id };

    if (producerId) payload.producerId = producerId;
    if (productId) payload.productId = productId;

    const favorite = await Favorite.create(payload);
    return res.status(201).json(favorite);
  } catch (error) {
    console.error('Favorite creation failed:', error.message);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'This favorite already exists.' });
    }
    return res.status(500).json({ error: 'Unable to create favorite.' });
  }
};

const deleteFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ _id: req.params.id, userId: req.user._id });

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found.' });
    }

    await favorite.deleteOne();
    return res.status(200).json({ message: 'Favorite removed.' });
  } catch (error) {
    console.error('Favorite deletion failed:', error.message);
    return res.status(500).json({ error: 'Unable to delete favorite.' });
  }
};

module.exports = {
  createFavorite,
  deleteFavorite,
  listFavorites,
};
