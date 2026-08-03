export const DEFAULT_TIME_ZONE = "Europe/Warsaw";

function parseGmtOffsetToMinutes(offsetString) {
  if (!offsetString || offsetString === "GMT" || offsetString === "UTC") {
    return 0;
  }

  const match = offsetString.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/i);
  if (!match) {
    return 0;
  }

  const sign = match[1] === "+" ? 1 : -1;
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);

  return sign * (hours * 60 + minutes);
}

function getTimeZoneOffsetMinutes(date, timeZone = DEFAULT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
  }).formatToParts(date);

  const zonePart = parts.find((part) => part.type === "timeZoneName");
  return parseGmtOffsetToMinutes(zonePart?.value);
}

export function parseDateTimeLocalInTimeZone(
  dateTimeLocal,
  timeZone = DEFAULT_TIME_ZONE
) {
  if (!dateTimeLocal) {
    return null;
  }

  const [datePart, timePart] = dateTimeLocal.split("T");
  if (!datePart || !timePart) {
    return null;
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second = 0] = timePart.split(":").map(Number);

  if ([year, month, day, hour, minute].some(Number.isNaN)) {
    return null;
  }

  // Convert a wall-clock date (selected in the form) for the provided timezone into an exact instant.
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  let adjustedTime = utcGuess;

  // Two passes are enough to stabilize around DST boundary changes.
  for (let i = 0; i < 2; i += 1) {
    const offsetMinutes = getTimeZoneOffsetMinutes(new Date(adjustedTime), timeZone);
    adjustedTime = utcGuess - offsetMinutes * 60_000;
  }

  return new Date(adjustedTime);
}

export function formatDateTimeInTimeZone(
  dateInput,
  timeZone = DEFAULT_TIME_ZONE
) {
  if (!dateInput) {
    return "";
  }

  const parsedDate = new Date(dateInput);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(parsedDate);
}
