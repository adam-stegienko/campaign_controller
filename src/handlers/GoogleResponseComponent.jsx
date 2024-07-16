import React, { useState, useEffect } from "react";
import "./GoogleResponseComponent.css";

export function GoogleResponseComponent() {
    const [data, setData] = useState([]);

    useEffect(() => {
        // Correct path for fetching from the public directory
        const localFile = process.env.PUBLIC_URL + '/data/google_data.json';
        fetch(localFile)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to load local data with status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            setData(data);
          })
          .catch(error => console.error('Error fetching Google data:', error));
      }, []);

    return (
    <div>
        {data && data.length > 0 ? (
            <table className="table-responsive">
                <thead>
                    <tr>
                        <th>Campaign</th>
                        <th>State</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td>{item.campaign}</td>
                            <td>{item.state}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : (
            <div>Loading Google data...</div>
        )}
    </div>
    );
}

export default GoogleResponseComponent;