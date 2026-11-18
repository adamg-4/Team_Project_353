import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import EventsPage from './EventsPage';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EventsPage />
  </StrictMode>
);
