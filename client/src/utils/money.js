export function paiseToINR(paise) {
  const v = (Number(paise) || 0) / 100;
  return `₹${v.toLocaleString("en-IN", { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
}

export function paiseToFixed(paise) {
  return `₹${((Number(paise) || 0) / 100).toFixed(2)}`;
}

export function inrToPaise(v) {
  return Math.round(Number(v) * 100) || 0;
}

export function fmtHours(h) {
  return `${(Number(h) || 0).toFixed(2)}h`;
}

export function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
