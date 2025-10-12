import React, { useState, useRef, useEffect } from "react";
import "./PlannerbookForm.css";
import Configuration from "../services/Configuration.jsx";

export function PlannerbookForm({ onSubmit }) {
  const [executionDateValid, setExecutionDateValid] = useState(true);
  const [config, setConfig] = useState(null);
  const [isFormVisible, setFormVisible] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        const cfg = await Configuration.loadConfig();
        setConfig(cfg);
      } catch (error) {
        console.error("Error loading configuration:", error);
      }
    };

    loadConfiguration();
  }, []);

  const handleCreateClick = () => {
    setFormVisible(true);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!config) {
      console.error("Configuration not loaded");
      return;
    }

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    data.action = data.action === "Enable" ? 1 : 0;

    const executionDate = new Date(data.executionDate);
    const now = new Date();
    if (executionDate < now) {
      setExecutionDateValid(false);
      return;
    } else {
      setExecutionDateValid(true);
    }

    try {
      const baseUrl = config.REACT_APP_CAMPAIGN_CONTROLLER_API_URL;
      const url = `${baseUrl}/v1/api/plannerbooks`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const responseData = await response.json();
      if (onSubmit) {
        onSubmit(responseData);
      }
      formRef.current.reset();
      window.location.reload();
      handleCloseForm();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleCancelClick = (event) => {
    event.preventDefault();
    handleCloseForm();
  };

  return (
    <>
      {!isFormVisible && (
        <button
          className="form-button create-button-form"
          onClick={handleCreateClick}
        >
          Create
        </button>
      )}
      {isFormVisible && (
        <div className="form-border">
          <form className="form" onSubmit={handleSubmit} ref={formRef}>
            <h2 className="form-title">Manage Campaign</h2>
            <select className="form-select" name="campaign" required>
              <option value="" disabled>
                --Select Campaign--
              </option>
              <option value="Przeprowadzki">Przeprowadzki</option>
              <option value="Transport">Transport</option>
              <option value="Magazynowanie">Magazynowanie</option>
            </select>
            <select className="form-select" name="action" required>
              <option value="" disabled>
                --Select Action--
              </option>
              <option value="Enable">Enable</option>
              <option value="Disable">Disable</option>
            </select>
            <input
              className="form-input"
              type="datetime-local"
              name="executionDate"
              placeholder="Execution Date"
              required
              onChange={() => setExecutionDateValid(true)}
            />
            {!executionDateValid && (
              <p className="form-error">Execution date cannot be in the past.</p>
            )}
            <div className="all-form-buttons">
              <button className="form-button" type="submit">
                Submit
              </button>
              <button
                className="form-button cancel-button-form"
                onClick={handleCancelClick}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default PlannerbookForm;
