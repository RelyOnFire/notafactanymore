export const lifespanYears = (acceptedYear: number, changedYear: number) =>
  Math.max(0, changedYear - acceptedYear);

export const formatHistoricalYear = (year: number) => {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return String(year);
};

export const formatApproxYears = (years: number) => {
  const rounded = Number.isInteger(years) ? years : Math.round(years * 10) / 10;
  return `≈${rounded.toLocaleString('en-US')} ${rounded === 1 ? 'year' : 'years'}`;
};

export const median = (values: number[]) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
};

export const centuryNumber = (year: number) =>
  year > 0 ? Math.floor((year - 1) / 100) + 1 : 0;

export const ordinal = (value: number) => {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
};

export const centuryLabel = (year: number) => {
  const century = centuryNumber(year);
  return century > 0 ? `${ordinal(century)} century` : 'BCE';
};
