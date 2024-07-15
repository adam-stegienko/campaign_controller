import React, { useState, useEffect } from "react";
import "./ApiResponseComponent.css";

export function ApiResponseComponent() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const url = process.env.REACT_APP_CAMPAIGN_CONTROLLER_API_URL + "/v1/api/plannerbooks";
        console.log(`Fetching data from ${url}`);
        fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error(`API call failed with status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log('Data fetched successfully:', data);
            setData(data);
          })
          .catch(error => console.error('Error fetching data:', error));
      }, []);

    // Helper function to format the execution date
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
  };

    return (
    <div>
        {data && data.length > 0 ? (
            <table className="table-responsive">
                <thead>
                    <tr>
                        <th>Campaign</th>
                        <th>Action</th>
                        <th>Execution Time</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td>{item.campaign}</td>
                            <td>{item.action === 1 ? 'Enable' : 'Disable'}</td>
                            <td>{formatDate(item.executionDate)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : (
            <div>Loading data...</div>
        )}
    </div>
    );
}

export default ApiResponseComponent;