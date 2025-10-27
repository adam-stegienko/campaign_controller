import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { ApiResponseComponent } from "./handlers/ApiResponseComponent";
import { GoogleResponseComponent } from "./handlers/GoogleResponseComponent";
import { PlannerbookForm } from "./forms/PlannerbookForm";
import "./styles/container.css"

function useApiResponse() {
  const [apiResponseData, setApiResponseData] = useState(null);
  const handleFormSubmit = useCallback((data) => {
    setApiResponseData(data);
  }, []);

  return { apiResponseData, handleFormSubmit };
}

function App() {
  const { apiResponseData, handleFormSubmit } = useApiResponse();

  return (
    <div className="container">
      <ApiResponseComponent data={apiResponseData} />
      <GoogleResponseComponent data={apiResponseData} />
      <PlannerbookForm onSubmit={handleFormSubmit} />
    </div>
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

export default App;