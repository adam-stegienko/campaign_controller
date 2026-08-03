import React, { useState, useEffect } from "react";
import "../styles/ApiResponseComponent.css";
import Configuration from "../services/Configuration.jsx";
import { DEFAULT_TIME_ZONE, formatDateTimeInTimeZone } from "../utils/timezone";

export function ApiResponseComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Configuration.loadConfig();
        
        const apiUrl = Configuration.get('apiUrl');
        if (!apiUrl) {
          throw new Error('API URL not configured');
        }

        const url = `${apiUrl}/v1/api/plannerbooks`;
        
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

  const handleDelete = async (id) => {
    if (!Configuration.isConfigLoaded()) {
      console.error("Configuration not loaded");
      return;
    }

    if (window.confirm("Are you sure you want to delete the entry?")) {
      try {
        const apiUrl = Configuration.get('apiUrl');
        const url = `${apiUrl}/v1/api/plannerbooks/${id}`;

        const response = await fetch(url, { method: "DELETE" });
        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }
        
        setData(data.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
  };

  const formatDate = (dateString) => formatDateTimeInTimeZone(dateString, DEFAULT_TIME_ZONE);

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
              <th>Execution Time (Europe/Warsaw)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td className="campaign-cell" onClick={() => handleDelete(item.id)}>
                  {item.campaign}
                  <span className="delete-icon">🗑️</span>
                </td>
                <td>{item.action === 1 ? "Enable" : "Disable"}</td>
                <td>{formatDate(item.executionDate)}</td>
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
