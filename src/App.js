import "./App.css";
import React from "react";
import { useState } from "react";
import { ApiActionButton } from "./handlers/ApiActionButton";
import { ApiResponseComponent } from "./handlers/ApiResponseComponent";
import { GoogleResponseComponent } from "./handlers/GoogleResponseComponent";
import { PlannerbookForm } from "./forms/PlannerbookForm";

function App() {
  const [apiResponseData, setApiResponseData] = useState(null);

  const handleFormSubmit = (data) => {
    setApiResponseData(data);
  };

  return (
    <React.StrictMode>
      <ApiResponseComponent data={apiResponseData} />
      <GoogleResponseComponent data={apiResponseData} />
      <PlannerbookForm onSubmit={handleFormSubmit} />
      <ApiActionButton action={() => console.log("API action triggered")} />
    </React.StrictMode>
  );
}

export default App;
