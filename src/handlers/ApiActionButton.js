export function ApiActionButton({ action }) {
  const getPlannerbooksUrl =
    process.env.REACT_APP_CAMPAIGN_CONTROLLER_API_URL + "/v1/api/plannerbooks";
  const handleClick = () => {
    // Perform API action
    fetch(getPlannerbooksUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Data fetched successfully:", data);
        action(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  return <button onClick={handleClick}>Trigger API</button>;
}

export default ApiActionButton;
