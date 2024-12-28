import React, { useState, useEffect } from "react";
import "./GoogleResponseComponent.css";
import { GoogleAdsApi } from "google-ads-api";

export function GoogleResponseComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        console.log(`REACT_APP_CLIENT_ID: ${process.env.REACT_APP_CLIENT_ID}`);
        console.log(`REACT_APP_CLIENT_SECRET: ${process.env.REACT_APP_CLIENT_SECRET}`);
        console.log(`REACT_APP_DEVELOPER_TOKEN: ${process.env.REACT_APP_DEVELOPER_TOKEN}`);
        console.log(`REACT_APP_CUSTOMER_ID: ${process.env.REACT_APP_CUSTOMER_ID}`);
        console.log(`REACT_APP_REFRESH_TOKEN: ${process.env.REACT_APP_REFRESH_TOKEN}`);

        const googleAdsApi = new GoogleAdsApi({
          client_id: process.env.REACT_APP_CLIENT_ID,
          client_secret: process.env.REACT_APP_CLIENT_SECRET,
          developer_token: process.env.REACT_APP_DEVELOPER_TOKEN,
        });

        try {
          const customers = await googleAdsApi.listAccessibleCustomers(process.env.REACT_APP_REFRESH_TOKEN);
          console.log("Customers fetched successfully");
          console.log(customers);
        } catch (error) {
          console.error("Error fetching customers:", error);
        }

        const customer = googleAdsApi.Customer({
          customer_id: process.env.REACT_APP_CUSTOMER_ID,
          refresh_token: process.env.REACT_APP_REFRESH_TOKEN,
        });

        const campaigns = await customer.campaigns.list();
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
