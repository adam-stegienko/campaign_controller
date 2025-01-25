import React, { useState, useEffect } from "react";
import "./ApiResponseComponent.css";

export function ApiResponseComponent() {
  const [data, setData] = useState([]);
  const base_url = process.env.REACT_APP_CAMPAIGN_CONTROLLER_API_URL;

  useEffect(() => {
    const url = `${base_url}/v1/api/plannerbooks`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Helper function to format the execution date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to handle delete action
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete the entry?")) {
      const url = `${base_url}/v1/api/plannerbooks/${id}`;
      fetch(url, { method: "DELETE" })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
          }
          // Update state to remove the deleted item
          setData(data.filter((item) => item.id !== id));
        })
        .catch((error) => console.error("Error deleting data:", error));
    }
  };

  return (
    <div className="table-container">
      {data && data.length > 0 ? (
        <table className="table-responsive">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Action</th>
              <th>Execution Time</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.campaign}</td>
                <td>{item.action === 1 ? "Enable" : "Disable"}</td>
                <td>{formatDate(item.executionDate)}</td>
                <td>
                  <button onClick={() => handleDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-data">No data found</div>
      )}
    </div>
  );
}

export default ApiResponseComponent;
