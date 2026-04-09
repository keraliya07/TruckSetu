const cityOptions = [
  { city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { city: 'Surat', lat: 21.1702, lng: 72.8311 },
  { city: 'Vadodara', lat: 22.3072, lng: 73.1812 },
  { city: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { city: 'Nashik', lat: 19.9975, lng: 73.7898 },
  { city: 'Pune', lat: 18.5204, lng: 73.8567 },
  { city: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { city: 'Delhi', lat: 28.6139, lng: 77.209 },
];

const cityAliases = new Map([
  ['bombay', 'Mumbai'],
  ['baroda', 'Vadodara'],
  ['gujarat', 'Ahmedabad'],
  ['gujrat', 'Ahmedabad'],
]);

const normalize = (value = '') => String(value).trim().toLowerCase();

const resolveCityCoordinates = (city) => {
  const normalized = normalize(city);
  if (!normalized) {
    return null;
  }

  const canonicalCity = cityAliases.get(normalized) || city;
  const match = cityOptions.find((entry) => normalize(entry.city) === normalize(canonicalCity));

  return match ? { lat: match.lat, lng: match.lng, city: match.city } : null;
};

module.exports = {
  cityOptions,
  resolveCityCoordinates,
};
