import React, { useState, useEffect } from "react";
import "../styles/GoogleResponseComponent.css";
import Configuration from "../services/Configuration.jsx";

export function GoogleResponseComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        // Load configuration first
        const cfg = await Configuration.loadConfig();

        const baseUrl = cfg.REACT_APP_GOOGLE_ADS_API_URL;
        const customerId = cfg.REACT_APP_GOOGLE_ADS_CUSTOMER_ID;
        const campaignNames = cfg.REACT_APP_GOOGLE_ADS_CAMPAIGN_NAMES;
        const url = `${baseUrl}/v1/api/google-ads/campaigns/status?customerId=${customerId}&campaignNames=${campaignNames}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const campaigns = await response.json();

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
