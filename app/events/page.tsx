const events = [
    { id: '1', name: 'Coldplay Live', date: '2025-05-10' },
    { id: '2', name: 'Adele Tour', date: '2025-06-12' },
  ];
  
  export default function EventsPage() {
    return (
      <div>
        <h2>Available Events</h2>
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <a href={`/events/${event.id}`}>
                {event.name} - {event.date}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  