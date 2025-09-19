export function formatRelativeTime(input: string | number | Date) {
  const target = new Date(input).getTime();
  if (Number.isNaN(target)) return "刚刚";

  const diffInSeconds = Math.round((target - Date.now()) / 1000);
  const absSeconds = Math.abs(diffInSeconds);

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: "year", seconds: 60 * 60 * 24 * 365 },
    { unit: "month", seconds: 60 * 60 * 24 * 30 },
    { unit: "week", seconds: 60 * 60 * 24 * 7 },
    { unit: "day", seconds: 60 * 60 * 24 },
    { unit: "hour", seconds: 60 * 60 },
    { unit: "minute", seconds: 60 },
  ];

  for (const { unit, seconds } of units) {
    if (absSeconds >= seconds || unit === "minute") {
      const value = Math.round(diffInSeconds / seconds);
      return new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" }).format(value, unit);
    }
  }

  return "刚刚";
}
