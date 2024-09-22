import { useState, useEffect } from "react";

export function EventsController({ onDataUpdate }) {
  const [data, setData] = useState(null);

  let base_url;
  if (process.env.NODE_ENV === "development") {
    base_url = "http://localhost:8099";
  } else {
    base_url = "https://campaign-controller.stegienko.com:8443";
  }

  useEffect(() => {
    const subscribeEventsUrl = `${base_url}/events`;
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

  return (
    data ? (
      <div>
        <h2>Event Data</h2>
        <div>ID: {data.id}</div>
        <div>Campaign: {data.campaign}</div>
        <div>Action: {data.action}</div>
      </div>
    ) : null
  );
}

export default EventsController;