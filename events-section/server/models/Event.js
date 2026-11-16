const mongoose = require('mongoose');

const ORGANISER_TYPES = ['MSU', 'Club', 'Society', 'Other'];
const SOURCES = ['survey', 'interview', 'organiser', 'team'];

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', trim: true, maxlength: 1000 },
    organiser: { type: String, required: true, trim: true }, // e.g. "Drama Society"
    organiserType: { type: String, enum: ORGANISER_TYPES, required: true },
    location: { type: String, required: true, trim: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    isFree: { type: Boolean, default: true },
    price: { type: Number, default: 0, min: 0 },
    link: { type: String, trim: true }, // sign-up / Instagram / Eventbrite etc.
    tags: [{ type: String, trim: true, lowercase: true }],
    // Where did we find out about it? Handy to cite in your research write-up.
    source: { type: String, enum: SOURCES, default: 'team' },
  },
  { timestamps: true }
);

eventSchema.index({ startsAt: 1 });
eventSchema.index({ endsAt: 1 });

eventSchema.pre('validate', function () {
  if (this.startsAt && this.endsAt && this.endsAt < this.startsAt) {
    this.invalidate('endsAt', 'End time must be after the start time');
  }
});

module.exports = mongoose.model('Event', eventSchema);
module.exports.ORGANISER_TYPES = ORGANISER_TYPES;
