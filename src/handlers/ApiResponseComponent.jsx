import React, { useState, useEffect } from "react";
import "../styles/ApiResponseComponent.css";
import Configuration from "../services/Configuration.jsx";

export function ApiResponseComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load configuration first
        const cfg = await Configuration.loadConfig();
        setConfig(cfg);

        const baseUrl = cfg.REACT_APP_CAMPAIGN_CONTROLLER_API_URL;
        const url = `${baseUrl}/v1/api/plannerbooks`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }
        
        const fetchedData = await response.json();
        setData(fetchedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
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
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete the entry?")) {
      try {
        const baseUrl = config.REACT_APP_CAMPAIGN_CONTROLLER_API_URL;
        const url = `${baseUrl}/v1/api/plannerbooks/${id}`;
        
        const response = await fetch(url, { method: "DELETE" });
        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }
        
        // Update state to remove the deleted item
        setData(data.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
  };

  if (loading) {
    return <div>Loading planner books...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error.message}</div>;
  }

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
