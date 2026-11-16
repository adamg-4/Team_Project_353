const dateFmt = new Intl.DateTimeFormat('en-IE', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});
const timeFmt = new Intl.DateTimeFormat('en-IE', { hour: '2-digit', minute: '2-digit' });

export default function EventCard({ event }) {
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  const now = new Date();
  const isLive = start <= now && end >= now;

  return (
    <article className={`event-card${isLive ? ' event-card--live' : ''}`}>
      <div className="event-card__top">
        <span className={`badge badge--${event.organiserType.toLowerCase()}`}>
          {event.organiserType}
        </span>
        {isLive && <span className="badge badge--live">Live now</span>}
      </div>

      <h3 className="event-card__title">{event.title}</h3>
      <p className="event-card__organiser">{event.organiser}</p>

      <p className="event-card__meta">
        {dateFmt.format(start)}, {timeFmt.format(start)} – {timeFmt.format(end)}
      </p>
      <p className="event-card__meta">{event.location}</p>

      {event.description && <p className="event-card__desc">{event.description}</p>}

      <div className="event-card__footer">
        <span className="event-card__price">
          {event.isFree ? 'Free' : `€${Number(event.price).toFixed(2)}`}
        </span>
        {event.link && (
          <a href={event.link} target="_blank" rel="noopener noreferrer">
            More info
          </a>
        )}
      </div>
    </article>
  );
}
