import React, { useState, useEffect } from "react";
import "./GoogleResponseComponent.css";
// import { GoogleAdsApi, ResourceNames, errors } from "google-ads-api";
// import { google } from "googleapis";

export function GoogleResponseComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      
      try {
        const campaigns = [
          { id: 1, name: "Przeprowadzki", status: "Enabled" },
          { id: 2, name: "Magazynowanie", status: "Enabled" },
          { id: 3, name: "Transport", status: "Enabled" },
        ];

        campaigns.forEach((campaign) => {
          console.log(`Campaign ID: ${campaign.id}, Name: ${campaign.name}, Status: ${campaign.status}`);
        });
        console.log("Campaigns fetched successfully");

        const campaignData = campaigns.map((campaign) => ({
          id: campaign.id,
          campaign: campaign.name,
          state: campaign.status,
        }));
        setData(campaignData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) {
    return <div>Loading Google data...</div>;
  }

  if (error) {
    return <div>Error fetching Google data: {error.message}</div>;
  }

  return (
    <div className="google-container">
      {data && data.length > 0 ? (
        <table className="google-responsive">
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
        <div>No data available</div>
      )}
    </div>
  );
}

export default GoogleResponseComponent;
