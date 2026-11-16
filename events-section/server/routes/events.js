const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');

const router = express.Router();
const { ORGANISER_TYPES } = Event;

const HOUR = 60 * 60 * 1000;
const WRITABLE_FIELDS = [
  'title', 'description', 'organiser', 'organiserType', 'location',
  'startsAt', 'endsAt', 'isFree', 'price', 'link', 'tags', 'source',
];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Only let known fields through (stops people setting _id, createdAt, etc.)
const pickWritable = (body) =>
  Object.fromEntries(WRITABLE_FIELDS.filter((k) => k in body).map((k) => [k, body[k]]));

// Write routes are open unless ADMIN_KEY is set in .env
function requireAdmin(req, res, next) {
  const key = process.env.ADMIN_KEY;
  if (!key || req.get('x-admin-key') === key) return next();
  res.status(401).json({ error: 'Unauthorised' });
}

router.param('id', (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid event id' });
  next();
});

/**
 * GET /api/events
 *   ?when=upcoming|now|today|week|all   (default: upcoming = hasn't finished yet)
 *   ?type=MSU|Club|Society|Other
 *   ?q=search text (title, organiser, description, location, tags)
 *   ?free=true
 */
router.get('/', async (req, res) => {
  try {
    const { q, type, when = 'upcoming', free } = req.query;
    const now = new Date();
    const filter = {};

    switch (when) {
      case 'now': // started and not finished
        filter.startsAt = { $lte: now };
        filter.endsAt = { $gte: now };
        break;
      case 'today': { // anything still on that starts before midnight tonight
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        filter.startsAt = { $lte: endOfDay };
        filter.endsAt = { $gte: now };
        break;
      }
      case 'week':
        filter.startsAt = { $lte: new Date(now.getTime() + 7 * 24 * HOUR) };
        filter.endsAt = { $gte: now };
        break;
      case 'all':
        break;
      default: // 'upcoming'
        filter.endsAt = { $gte: now };
    }

    if (typeof type === 'string' && ORGANISER_TYPES.includes(type)) {
      filter.organiserType = type;
    }

    if (free === 'true') filter.isFree = true;

    if (typeof q === 'string' && q.trim()) {
      const rx = new RegExp(escapeRegex(q.trim()), 'i');
      filter.$or = [
        { title: rx }, { organiser: rx }, { description: rx }, { location: rx }, { tags: rx },
      ];
    }

    const events = await Event.find(filter).sort({ startsAt: 1 }).limit(100).lean();
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load events' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load event' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const event = await Event.create(pickWritable(req.body));
    res.status(201).json(event);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Could not create event' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    event.set(pickWritable(req.body));
    await event.save();
    res.json(event);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Could not update event' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete event' });
  }
});

module.exports = router;
