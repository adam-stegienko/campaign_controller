import React, { useState, useRef } from 'react';

export function PlannerbookForm({ onSubmit }) {
  const [executionDateValid, setExecutionDateValid] = useState(true);
  const formRef = useRef(null); // Step 1: Create a ref for the form
  const url = process.env.REACT_APP_CAMPAIGN_CONTROLLER_API_URL + "/v1/api/plannerbooks";

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    data.action = data.action === 'Enable' ? 1 : 0;

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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} ref={formRef}> {/* Step 3: Attach the ref to the form */}
      <select name="campaign" required>
        <option value="">Select Campaign</option>
        <option value="Przeprowadzki">Przeprowadzki</option>
        <option value="Magazynowanie">Magazynowanie</option>
        <option value="Transport">Transport</option>
      </select>
      <select name="action" required>
        <option value="">Select Action</option>
        <option value="Enable">Enable</option>
        <option value="Disable">Disable</option>
      </select>
      <input type="datetime-local" name="executionDate" placeholder="Execution Date" required onChange={() => setExecutionDateValid(true)} />
      {!executionDateValid && <p style={{ color: 'red' }}>Execution date cannot be in the past.</p>}
      <button type="submit">Submit</button>
    </form>
  );
}

export default PlannerbookForm;