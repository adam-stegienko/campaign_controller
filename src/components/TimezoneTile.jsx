import React, { useEffect, useState } from "react";
import "../styles/TimezoneTile.css";
import { DEFAULT_TIME_ZONE, formatDateTimeInTimeZone } from "../utils/timezone";

export function TimezoneTile() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="timezone-tile" aria-label="Current app timezone information">
      <p className="timezone-tile__label">Current app timezone</p>
      <h2 className="timezone-tile__zone">{DEFAULT_TIME_ZONE}</h2>
      <p className="timezone-tile__time">{formatDateTimeInTimeZone(now, DEFAULT_TIME_ZONE)}</p>
      <p className="timezone-tile__hint">
        All execution times in this app are displayed in this timezone.
      </p>
    </section>
  );
}

export default TimezoneTile;
