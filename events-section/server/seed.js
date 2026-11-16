/**
 * Seed script: `npm run seed`
 *
 * !! WARNING: wipes the events collection, then inserts the list below. !!
 *
 * The events below are PLACEHOLDERS so you can see the page working.
 * Replace them with the real events from your primary research
 * (surveys, interviews, checking MSU / club / soc socials), and set `source`
 * so you can say where each one came from in your write-up.
 *
 * Times are written as "hours from now" so something is always on when you demo.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

const HOUR = 60 * 60 * 1000;
const at = (hoursFromNow, durationHours) => {
  const startsAt = new Date(Date.now() + hoursFromNow * HOUR);
  return { startsAt, endsAt: new Date(startsAt.getTime() + durationHours * HOUR) };
};

const events = [
  {
    title: 'Weekly Pub Quiz',
    description: 'Teams of up to 5. Prizes for the top three teams.',
    organiser: 'Students\' Union',
    organiserType: 'MSU',
    location: 'SU Bar',
    ...at(-1, 3), // already started: shows as LIVE
    isFree: true,
    tags: ['quiz', 'social'],
    source: 'team',
  },
  {
    title: 'Freshers Week Welcome Fair',
    description: 'Meet reps from every club and society and sign up on the day.',
    organiser: 'Students\' Union',
    organiserType: 'MSU',
    location: 'Main Concourse',
    ...at(3, 5),
    isFree: true,
    tags: ['fair', 'sign-up'],
    source: 'team',
  },
  {
    title: 'Open Mic Night',
    description: 'Music, poetry, comedy. Sign up to perform or just come and listen.',
    organiser: 'Music Society',
    organiserType: 'Society',
    location: 'Arts Building, Room 2',
    ...at(6, 3),
    isFree: true,
    tags: ['music', 'performance'],
    source: 'survey',
  },
  {
    title: 'Intro to Debating Workshop',
    description: 'Beginner-friendly. No experience needed.',
    organiser: 'Debating Society',
    organiserType: 'Society',
    location: 'Library Seminar Room',
    ...at(26, 2),
    isFree: true,
    tags: ['debate', 'workshop'],
    source: 'interview',
  },
  {
    title: 'Home Match vs Visiting Club',
    description: 'Come down and support the team.',
    organiser: 'Football Club',
    organiserType: 'Club',
    location: 'Sports Campus, Pitch 2',
    ...at(30, 2),
    isFree: true,
    tags: ['sport', 'match'],
    source: 'survey',
  },
  {
    title: 'Coding Club: Build a Web App in an Evening',
    description: 'Bring a laptop. We\'ll pair up and build something small.',
    organiser: 'Computer Science Society',
    organiserType: 'Society',
    location: 'Science Building, Lab 3',
    ...at(50, 3),
    isFree: true,
    tags: ['tech', 'workshop'],
    source: 'organiser',
  },
  {
    title: 'Charity Ball',
    description: 'Formal night out in aid of a local charity. Dress code: black tie.',
    organiser: 'Students\' Union',
    organiserType: 'MSU',
    location: 'Main Hall',
    ...at(24 * 6, 5),
    isFree: false,
    price: 25,
    link: 'https://example.com/tickets',
    tags: ['ball', 'charity', 'social'],
    source: 'team',
  },
  {
    title: 'Sunrise Hike',
    description: 'Early start, good views, breakfast after. Meet at the front gate.',
    organiser: 'Hiking Club',
    organiserType: 'Club',
    location: 'Meet at Front Gate',
    ...at(24 * 9, 4),
    isFree: true,
    tags: ['outdoors', 'sport'],
    source: 'survey',
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uni-app');
    await Event.deleteMany({});
    const created = await Event.insertMany(events);
    console.log(`Seeded ${created.length} events`);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
