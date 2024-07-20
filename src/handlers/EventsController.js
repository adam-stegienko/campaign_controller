import { useState, useEffect } from "react";

export function EventsController({ onDataUpdate }) {
  const [data, setData] = useState(null);

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
        setData(newEvent);
        onDataUpdate(newEvent);
        console.log("Parsed event data", newEvent);
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

  return (data) ? (data.id) : null;
}

export default EventsController;