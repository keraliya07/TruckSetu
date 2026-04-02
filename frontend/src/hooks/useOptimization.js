import { useCallback, useState } from 'react';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function estimateRoute(shipments, truck) {
  const pickup = shipments[0];
  const uniqueDestinations = [
    ...new Map(shipments.map((shipment) => [shipment.destCity, shipment])).values(),
  ];

  const stops = [
    {
      sequence: 1,
      type: 'PICKUP',
      city: pickup.originCity,
      address: pickup.originAddress,
      lat: pickup.originLat,
      lng: pickup.originLng,
      status: 'PENDING',
    },
    ...uniqueDestinations.map((shipment, index) => ({
      sequence: index + 2,
      type: 'DELIVERY',
      city: shipment.destCity,
      address: shipment.destAddress,
      lat: shipment.destLat,
      lng: shipment.destLng,
      status: 'PENDING',
    })),
  ];

  const totalDistanceKm = 90 + uniqueDestinations.length * 65 + shipments.length * 28;
  const totalWeightKg = shipments.reduce(
    (sum, shipment) => sum + Number(shipment.weightKg || 0),
    0
  );
  const estimatedDurationHours = Math.max(4, Math.round(totalDistanceKm / 42));

  return {
    stops,
    totalDistanceKm,
    estimatedDuration: `${estimatedDurationHours}h`,
    loadWeightKg: totalWeightKg,
    truckPosition: {
      lat: truck.currentLat || pickup.originLat,
      lng: truck.currentLng || pickup.originLng,
    },
  };
}

function scoreTruck(shipments, truck, maxBaseRate) {
  const totalWeightKg = shipments.reduce(
    (sum, shipment) => sum + Number(shipment.weightKg || 0),
    0
  );
  const totalVolumeM3 = shipments.reduce(
    (sum, shipment) => sum + Number(shipment.volumeM3 || 0),
    0
  );

  if (totalWeightKg > truck.maxWeightKg || totalVolumeM3 > truck.maxVolumeM3) {
    return null;
  }

  const route = estimateRoute(shipments, truck);
  const weightUtilization = totalWeightKg / truck.maxWeightKg;
  const volumeUtilization = totalVolumeM3 / truck.maxVolumeM3;
  const blendedUtilization = (weightUtilization * 0.65 + volumeUtilization * 0.35) * 100;
  const utilizationScore = 100 - Math.abs(82 - blendedUtilization) * 1.8;
  const routeMatch =
    truck.currentCity?.toLowerCase() === shipments[0].originCity?.toLowerCase()
      ? 92
      : truck.dealer?.primaryCity?.toLowerCase() === shipments[0].originCity?.toLowerCase()
        ? 80
        : 63;

  const totalWeightTons = totalWeightKg / 1000;
  const baseRate = Number(truck.dealer?.baseRatePerKmTon || 0);
  const estimatedCost = Math.round(baseRate * totalWeightTons * route.totalDistanceKm);
  const costScore = clamp(100 - (baseRate / Math.max(maxBaseRate, 1)) * 42, 38, 96);
  const emissionsIndex =
    (Number(truck.emissionFactor || 2.68) / Math.max(Number(truck.fuelEfficiency || 4), 1)) *
    100;
  const co2Score = clamp(110 - emissionsIndex, 40, 96);

  const composite =
    utilizationScore * 0.35 +
    routeMatch * 0.25 +
    costScore * 0.2 +
    co2Score * 0.2;

  return {
    truck,
    route,
    estimatedCost,
    co2Saved: Math.max(4, Math.round(route.totalDistanceKm * (co2Score / 100) * 0.2)),
    scores: {
      utilization: clamp(utilizationScore, 0, 100),
      route: clamp(routeMatch, 0, 100),
      cost: clamp(costScore, 0, 100),
      co2: clamp(co2Score, 0, 100),
      composite: clamp(composite, 0, 100),
    },
  };
}

export function useOptimization() {
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState(null);

  const runOptimization = useCallback(async ({ shipments, trucks }) => {
    setIsOptimizing(true);
    setError(null);

    try {
      if (!shipments?.length) {
        throw new Error('Select at least one shipment before running optimization');
      }

      if (!trucks?.length) {
        throw new Error('No available trucks are visible for this lane yet');
      }

      const maxBaseRate = Math.max(
        ...trucks.map((truck) => Number(truck.dealer?.baseRatePerKmTon || 0)),
        1
      );

      const computed = trucks
        .map((truck) => scoreTruck(shipments, truck, maxBaseRate))
        .filter(Boolean)
        .sort((a, b) => b.scores.composite - a.scores.composite);

      setResults(computed);
      setSelectedResult(computed[0] || null);
      return computed;
    } catch (runError) {
      setError(runError.message);
      throw runError;
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  return {
    clearResults: () => {
      setResults([]);
      setSelectedResult(null);
      setError(null);
    },
    error,
    isOptimizing,
    results,
    runOptimization,
    selectedResult,
    selectResult: setSelectedResult,
  };
}
