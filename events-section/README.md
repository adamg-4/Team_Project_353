# Events section

Live campus events (MSU, clubs, societies) for the uni navigation app.
React frontend, Express + MongoDB backend.

```
server/   Express API + Mongoose model + seed script
client/   React page (drop client/src/* into your app's src/)
```

## Run it

**1. Backend**

```bash
cd server
npm install
cp .env.example .env      # edit MONGO_URI if you use Atlas
npm run seed              # loads placeholder events (wipes the events collection!)
npm run dev               # http://localhost:5000
```

**2. Frontend**

Copy `EventsPage.jsx`, `EventCard.jsx`, `api.js` and `events.css` into your React app's `src/`, then render it:

```jsx
import EventsPage from './EventsPage';
// e.g. <Route path="/events" element={<EventsPage />} />
```

The page calls `/api/events`, so proxy `/api` to the server in dev:

- **Vite** (`vite.config.js`):
  ```js
  export default defineConfig({
    plugins: [react()],
    server: { proxy: { '/api': 'http://localhost:5000' } },
  });
  ```
- **Create React App** (`package.json`): `"proxy": "http://localhost:5000"`

## API

| Method | Route | What it does |
|---|---|---|
| GET | `/api/events` | List events. Filters: `when` (`upcoming` default, `now`, `today`, `week`, `all`), `type` (`MSU`, `Club`, `Society`, `Other`), `q` (search text), `free=true` |
| GET | `/api/events/:id` | One event |
| POST | `/api/events` | Create an event |
| PUT | `/api/events/:id` | Update an event |
| DELETE | `/api/events/:id` | Delete an event |

If `ADMIN_KEY` is set in `.env`, POST/PUT/DELETE need an `x-admin-key` header with that value.

## Getting your research data in

The seed events are **placeholders**. Replace them with what you find from students, MSU and club/soc socials. Two ways:

1. Edit the `events` array in `server/seed.js` and run `npm run seed` again.
2. Add one at a time:
   ```bash
   curl -X POST http://localhost:5000/api/events \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Open Mic Night",
       "organiser": "Music Society",
       "organiserType": "Society",
       "location": "Arts Building, Room 2",
       "startsAt": "2026-11-20T19:00:00Z",
       "endsAt": "2026-11-20T22:00:00Z",
       "isFree": true,
       "tags": ["music"],
       "source": "survey"
     }'
   ```

`source` (`survey`, `interview`, `organiser`, `team`) records where each event came from, which is useful for your write-up.

## Event fields

`title`, `description`, `organiser`, `organiserType`, `location`, `startsAt`, `endsAt`, `isFree`, `price`, `link`, `tags`, `source`.

## Known limits

- Events are entered by hand. There's no live feed from MSU or club pages.
- "Today" and "this week" use the server's clock and timezone.
- Search is a simple substring match, which is fine at this scale.
