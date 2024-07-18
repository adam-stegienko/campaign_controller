import React, { useState, useEffect } from "react";

export function EventsController({ onDataUpdate }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const subscribeEventsUrl = process.env.REACT_APP_CAMPAIGN_CONTROLLER_API_URL + "/events";
    const eventSource = new EventSource(subscribeEventsUrl);

    eventSource.onopen = () => {
      console.log("Connection opened");
    };

    eventSource.onmessage = (event) => {
      console.log("Received event", event);
      try {
        const newEvent = JSON.parse(event.data);
        setData(
          newEvent,
          onDataUpdate(newEvent)
        );
      } catch (error) {
        console.error("Error parsing event data:", event.data, error);
      }
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
  }, [onDataUpdate]);

  return (
    <div>
        <h2>Received Data</h2>
        {console.log("data: ", data[0].id)}
        <div>
          {data.map((event) => (
            <div key={event.id}>
              <div>{event.id}</div>
              <div>{event.campaign}</div>
              <div>{event.action}</div>
            </div>
          ))}
        </div>
    </div>
  );
}

export default EventsController;