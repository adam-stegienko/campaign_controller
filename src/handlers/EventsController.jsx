import { useState, useEffect } from "react";
import axios from "axios";

export function EventsController({ onDataUpdate }) {
  const [data, setData] = useState(null);
  const baseUrl = process.env.REACT_APP_CAMPAIGN_CONTROLLER_API_URL;
  const customerId = process.env.REACT_APP_GOOGLE_ADS_CUSTOMER_ID;

  useEffect(() => {
    const subscribeEventsUrl = `${baseUrl}/events`;
    const eventSource = new EventSource(subscribeEventsUrl);

    eventSource.onopen = () => {
      console.log("Connection opened");
    };

    eventSource.onmessage = async (event) => {
      console.log("Received event", event);
      try {
        const newEvent = JSON.parse(event.data);
        setData(newEvent);
        onDataUpdate(newEvent);
        console.log("Parsed event data", newEvent);

        // Process the event
        if (newEvent.campaign) {
          console.log(`Plannerbook is updating the campaign: ${newEvent.campaign}`);

          // API call to update campaign
          let campaignStatus = newEvent.action === 1 ? "ENABLED" : "PAUSED";
          const updateResponse = await axios.put(`${baseUrl}/v1/api/google-ads/campaigns/status/${newEvent.campaign}?customerId=${customerId}&status=${campaignStatus}`, { status: newEvent.campaign.status });

          if (updateResponse.status >= 200 && updateResponse.status < 300) {
            console.log("Campaign update successful. Plannerbook is going to be deleted now.");

            // Delete the plannerbook
            await axios.delete(`${baseUrl}/v1/api/plannerbooks/${newEvent.id}`);
            console.log("Plannerbook deleted successfully.");
          } else {
            console.error("Failed to update campaign:", updateResponse);
          }
        }
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
  }, [onDataUpdate, baseUrl]);

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
