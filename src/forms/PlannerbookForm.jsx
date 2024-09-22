import React, { useState, useRef } from "react";
import "./PlannerbookForm.css";

export function PlannerbookForm({ onSubmit }) {
  const [executionDateValid, setExecutionDateValid] = useState(true);
  const formRef = useRef(null); // Step 1: Create a ref for the form

  let base_url;
  if (process.env.NODE_ENV === "development") {
    base_url = "http://localhost:8099";
  } else {
    base_url = "https://campaign-controller.stegienko.com:8443";
  }

  const url = `${base_url}/v1/api/plannerbooks`;

  const [isFormVisible, setFormVisible] = useState(false);

  const handleCreateClick = () => {
    setFormVisible(true);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      onSubmit(responseData); // Callback with the response data
      formRef.current.reset(); // Step 2: Reset the form after successful submission
      // Refresh the page after successful submission
      window.location.reload();
      handleCloseForm();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  const handleCancelClick = async (event) => {
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
          <form class="form" onSubmit={handleSubmit} ref={formRef}>
            <h2 class="form-title">Manage Campaign</h2>
            <select class="form-select" name="campaign" required>
              <option value="" disabled selected>
                --Select Campaign--
              </option>
              <option value="Przeprowadzki">Przeprowadzki</option>
              <option value="Transport">Transport</option>
              <option value="Magazynowanie">Magazynowanie</option>
            </select>
            <select class="form-select" name="action" required>
              <option value="" disabled selected>
                --Select Action--
              </option>
              <option value="Enable">Enable</option>
              <option value="Disable">Disable</option>
            </select>
            <input
              class="form-input"
              type="datetime-local"
              name="executionDate"
              placeholder="Execution Date"
              required
              onChange={() => setExecutionDateValid(true)}
            />
            {!executionDateValid && (
              <p class="form-error">Execution date cannot be in the past.</p>
            )}
            <div className="all-form-buttons">
              <button class="form-button" type="submit">
                Submit
              </button>
              <button
                class="form-button cancel-button-form"
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
