import React from "react";
import PropTypes from "prop-types";

export function EventIdDisplayComponent({ eventId }) {
  return (
    <div>
      <h2>Event ID</h2>
      {eventId ? <p>{eventId}</p> : <p>No event ID received yet</p>}
    </div>
  );
}

EventIdDisplayComponent.propTypes = {
  eventId: PropTypes.string,
};

export default EventIdDisplayComponent;