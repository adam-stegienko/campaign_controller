import React, { useState, useEffect } from "react";
import "./GoogleResponseComponent.css";
import { GoogleAdsApi } from "google-ads-api";

export function GoogleResponseComponent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const googleAdsApi = new GoogleAdsApi({
      client_id: process.env.REACT_APP_CLIENT_ID,
      client_secret: process.env.REACT_APP_CLIENT_SECRET,
      developer_token: process.env.REACT_APP_DEVELOPER_TOKEN,
      refresh_token: process.env.REACT_APP_REFRESH_TOKEN,
    });

    const customer = googleAdsApi.Customer({
      customer_id: process.env.REACT_APP_CUSTOMER_ID,
    });

    // Fetch campaign statuses and log them
    customer.campaigns.list()
      .then((campaigns) => {
        campaigns.forEach((campaign) => {
          console.log(`Campaign ID: ${campaign.id}, Name: ${campaign.name}, Status: ${campaign.status}`);
        });
        console.log("Campaigns fetched successfully");

        // Set the data to state if you want to display it in the component
        const campaignData = campaigns.map((campaign) => ({
          id: campaign.id,
          campaign: campaign.name,
          state: campaign.status,
        }));
        setData(campaignData);
      })
      .catch((error) => {
        console.error("Error fetching campaigns:", error);
      });
  }, []);

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
        <div>Loading Google data...</div>
      )}
    </div>
  );
}

export default GoogleResponseComponent;
