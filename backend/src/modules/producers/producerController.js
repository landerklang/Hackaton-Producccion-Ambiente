const mongoose = require('mongoose');
const Producer = require('../../models/Producer');

const validStatuses = ['draft', 'published', 'archived'];

const normalizeLocation = (location) => {
  if (!location) {
    return undefined;
  }

  if (!location || typeof location !== 'object') {
    throw new Error('location must be an object with coordinates.');
  }

  const { coordinates } = location;

  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    throw new Error('location.coordinates must be an array of [longitude, latitude].');
  }

  const [lng, lat] = coordinates;

  if (typeof lng !== 'number' || typeof lat !== 'number') {
    throw new Error('location.coordinates must contain numeric longitude and latitude values.');
  }

  return {
    type: 'Point',
    coordinates: [lng, lat],
  };
};

const createProducer = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      profileText,
      whatsappNumber,
      instagram,
      addressText,
      location,
      status,
      ownerUserId,
    } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required.' });
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({ error: 'category is required.' });
    }

    if (ownerUserId !== undefined && ownerUserId !== null && !mongoose.Types.ObjectId.isValid(ownerUserId)) {
      return res.status(400).json({ error: 'ownerUserId must be a valid ObjectId.' });
    }

    const nextStatus = status && validStatuses.includes(status) ? status : 'draft';

    let normalizedLocation;
    try {
      normalizedLocation = normalizeLocation(location);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const producer = await Producer.create({
      name: name.trim(),
      category: category.trim(),
      description: description ? description.trim() : undefined,
      profileText: profileText ? profileText.trim() : undefined,
      whatsappNumber: whatsappNumber ? String(whatsappNumber).trim() : undefined,
      instagram: instagram ? String(instagram).trim() : undefined,
      addressText: addressText ? String(addressText).trim() : undefined,
      location: normalizedLocation,
      status: nextStatus,
      ownerUserId: ownerUserId ? new mongoose.Types.ObjectId(ownerUserId) : null,
    });

    return res.status(201).json(producer);
  } catch (error) {
    console.error('Producer creation failed:', error.message);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'This ownerUserId is already claimed by another producer.' });
    }
    return res.status(500).json({ error: 'Unable to create producer.' });
  }
};

const listProducers = async (req, res) => {
  try {
    const { status, category, q } = req.query;
    const filter = {};

    if (status && validStatuses.includes(status)) {
      filter.status = status;
    }

    if (category) {
      filter.category = new RegExp(String(category).trim(), 'i');
    }

    if (q) {
      filter.$or = [
        { name: { $regex: String(q).trim(), $options: 'i' } },
        { description: { $regex: String(q).trim(), $options: 'i' } },
        { profileText: { $regex: String(q).trim(), $options: 'i' } },
      ];
    }

    const producers = await Producer.find(filter).sort({ updatedAt: -1 }).lean();
    return res.status(200).json(producers);
  } catch (error) {
    console.error('Producer listing failed:', error.message);
    return res.status(500).json({ error: 'Unable to list producers.' });
  }
};

const getProducerById = async (req, res) => {
  try {
    const producer = await Producer.findById(req.params.id);

    if (!producer) {
      return res.status(404).json({ error: 'Producer not found.' });
    }

    return res.status(200).json(producer);
  } catch (error) {
    console.error('Producer lookup failed:', error.message);
    return res.status(400).json({ error: 'Invalid producer id.' });
  }
};

const updateProducer = async (req, res) => {
  try {
    const { status, location, ...rest } = req.body;

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'status must be one of: draft, published, archived.' });
    }

    const update = { ...rest };

    if (status) {
      update.status = status;
    }

    if (location !== undefined) {
      try {
        update.location = normalizeLocation(location);
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    }

    if (update.ownerUserId !== undefined && update.ownerUserId !== null && !mongoose.Types.ObjectId.isValid(update.ownerUserId)) {
      return res.status(400).json({ error: 'ownerUserId must be a valid ObjectId.' });
    }

    if (update.ownerUserId) {
      update.ownerUserId = new mongoose.Types.ObjectId(update.ownerUserId);
    }

    const producer = await Producer.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!producer) {
      return res.status(404).json({ error: 'Producer not found.' });
    }

    return res.status(200).json(producer);
  } catch (error) {
    console.error('Producer update failed:', error.message);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'This ownerUserId is already claimed by another producer.' });
    }
    return res.status(400).json({ error: 'Invalid producer update.' });
  }
};

module.exports = {
  createProducer,
  listProducers,
  getProducerById,
  updateProducer,
};
