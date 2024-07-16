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
        setData((prevData) => {
          const updatedData = [...prevData, newEvent];
          // Call the onDataUpdate function passed from the parent component
          onDataUpdate(updatedData);
          return updatedData;
        });
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
        {data.map((d, index) =>
          <span key={index}>{JSON.stringify(d)}</span>
        )}
    </div>
  );
}

export default EventsController;