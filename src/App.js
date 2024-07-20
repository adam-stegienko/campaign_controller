import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { ApiResponseComponent } from "./handlers/ApiResponseComponent";
import { GoogleResponseComponent } from "./handlers/GoogleResponseComponent";
import { PlannerbookForm } from "./forms/PlannerbookForm";
import { EventsController } from "./handlers/EventsController";
import { EventIdDisplayComponent } from "./handlers/EventIdDisplayComponent"; // Assuming you have this component

function useApiResponse() {
  const [apiResponseData, setApiResponseData] = useState(null);
  const handleFormSubmit = useCallback((data) => {
    setApiResponseData(data);
  }, []);

  return { apiResponseData, handleFormSubmit };
}

function App() {
  const { apiResponseData, handleFormSubmit } = useApiResponse();
  const [eventId, setEventId] = useState(null);

  const handleDataUpdate = (eventData) => {
    if (eventData && eventData.id) {
      setEventId(eventData.id);
    }
  };

  return (
    <>
      <ApiResponseComponent data={apiResponseData} />
      <GoogleResponseComponent data={apiResponseData} />
      <PlannerbookForm onSubmit={handleFormSubmit} />
      <EventsController onDataUpdate={handleDataUpdate} />
      <EventIdDisplayComponent eventId={eventId} />
    </>
  );
}

ApiResponseComponent.propTypes = {
  data: PropTypes.any, // Consider specifying a more detailed shape
};

GoogleResponseComponent.propTypes = {
  data: PropTypes.any, // Consider specifying a more detailed shape
};

PlannerbookForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

EventIdDisplayComponent.propTypes = {
  eventId: PropTypes.string, // Assuming eventId is a string
};

export default App;