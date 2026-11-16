// Relative URL: works with the dev proxy (see README) and when the API is served from the same origin.
const BASE = '/api/events';

export async function fetchEvents({ q, type, when, free }, signal) {
  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q.trim());
  if (type !== 'All') params.set('type', type);
  if (when) params.set('when', when);
  if (free) params.set('free', 'true');

  const res = await fetch(`${BASE}?${params}`, { signal });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}
