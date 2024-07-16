import React, { useState, useEffect } from "react";

export function EventsController() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const subscribeEventsUrl = process.env.REACT_APP_CAMPAIGN_CONTROLLER_API_URL + "/v1/api/plannerbooks/events";
    const eventSource = new EventSource(subscribeEventsUrl);

    eventSource.onopen = () => {
      console.log("Connection opened");
    };

    eventSource.onmessage = (event) => {
      console.log("Received event", event);
      const newEvent = JSON.parse(event.data);
      // Add a temporary unique identifier (e.g., timestamp + random) to each event for tracking
      const eventWithId = { ...newEvent, id: Date.now() + Math.random() };
      setEvents((prevEvents) => [...prevEvents, eventWithId]);

      // Set a timeout to remove the event after 10 seconds
      setTimeout(() => {
        setEvents((prevEvents) => prevEvents.filter((e) => e.id !== eventWithId.id));
      }, 10000); // 10000 milliseconds = 10 seconds
    };

    eventSource.onerror = (event) => {
      console.log("EventSource error", event);
      if (event.target.readyState === EventSource.CLOSED) {
        console.log("EventSource closed with state: (" + event.target.readyState + ")");
      }
      eventSource.close();
    };

    return () => {
      eventSource.close();
      console.log("EventSource closed");
    };
  }, []);

  return (
    <div>
      <h2>Events</h2>
      <div>
        {events.map((event, index) => (
          <pre key={event.id}>{JSON.stringify(event, null, 2)}</pre>
        ))}
      </div>
    </div>
  );
}

export default EventsController;