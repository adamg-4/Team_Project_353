import { useEffect, useState } from 'react';
import { fetchEvents } from './api';
import EventCard from './EventCard';
import './events.css';

const TYPES = ['All', 'MSU', 'Club', 'Society', 'Other'];
const WHEN = [
  { value: 'upcoming', label: 'All upcoming' },
  { value: 'now', label: 'Happening now' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
];
const REFRESH_MS = 60 * 1000; // re-check every minute so "live now" stays accurate

export default function EventsPage() {
  const [filters, setFilters] = useState({ q: '', type: 'All', when: 'upcoming', free: false });
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [tick, setTick] = useState(0);

  const update = (patch) => setFilters((f) => ({ ...f, ...patch }));

  // Auto-refresh
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  // Fetch whenever filters change (small delay so typing in search doesn't spam the API)
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setStatus((s) => (s === 'ready' ? s : 'loading'));
      fetchEvents(filters, controller.signal)
        .then((data) => {
          setEvents(data);
          setStatus('ready');
        })
        .catch((err) => {
          if (err.name !== 'AbortError') setStatus('error');
        });
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [filters, tick]);

  return (
    <section className="events-page">
      <header className="events-page__header">
        <h1>Events</h1>
        <p>What&apos;s on around campus: MSU, clubs and societies.</p>
      </header>

      <div className="filters">
        <input
          type="search"
          className="filters__search"
          placeholder="Search events, clubs, places…"
          value={filters.q}
          onChange={(e) => update({ q: e.target.value })}
          aria-label="Search events"
        />

        <div className="pills" role="group" aria-label="Filter by organiser">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={`pill${filters.type === t ? ' pill--active' : ''}`}
              onClick={() => update({ type: t })}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="pills" role="group" aria-label="Filter by time">
          {WHEN.map((w) => (
            <button
              key={w.value}
              type="button"
              className={`pill${filters.when === w.value ? ' pill--active' : ''}`}
              onClick={() => update({ when: w.value })}
            >
              {w.label}
            </button>
          ))}
        </div>

        <label className="filters__free">
          <input
            type="checkbox"
            checked={filters.free}
            onChange={(e) => update({ free: e.target.checked })}
          />
          Free only
        </label>
      </div>

      {status === 'loading' && <p className="state">Loading events…</p>}
      {status === 'error' && (
        <p className="state state--error">
          Couldn&apos;t load events. Check the server is running and try again.
        </p>
      )}
      {status === 'ready' && events.length === 0 && (
        <p className="state">Nothing matches those filters right now.</p>
      )}

      {status === 'ready' && events.length > 0 && (
        <div className="events-grid">
          {events.map((ev) => (
            <EventCard key={ev._id} event={ev} />
          ))}
        </div>
      )}
    </section>
  );
}
