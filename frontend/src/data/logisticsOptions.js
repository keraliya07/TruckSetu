export const cityOptions = [
  { city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { city: 'Surat', lat: 21.1702, lng: 72.8311 },
  { city: 'Vadodara', lat: 22.3072, lng: 73.1812 },
  { city: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { city: 'Nashik', lat: 19.9975, lng: 73.7898 },
  { city: 'Pune', lat: 18.5204, lng: 73.8567 },
  { city: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { city: 'Delhi', lat: 28.6139, lng: 77.209 },
];

export const truckTypes = [
  { value: 'Mini Truck', weight: 1500, volume: 10, fuelEfficiency: 8 },
  { value: 'LCV', weight: 3500, volume: 18, fuelEfficiency: 7 },
  { value: 'ICV', weight: 7500, volume: 32, fuelEfficiency: 5.5 },
  { value: 'Heavy Truck', weight: 16000, volume: 65, fuelEfficiency: 4 },
  { value: 'Trailer', weight: 28000, volume: 100, fuelEfficiency: 3.2 },
];

export function findCity(city) {
  return cityOptions.find((item) => item.city === city);
}

export function findTruckType(type) {
  return truckTypes.find((item) => item.value === type);
}
