import { useMemo, useState } from 'react';

import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';
import TruckResultCard from './TruckResultCard';

const sorters = {
  best: (a, b) => b.scores.composite - a.scores.composite,
  cost: (a, b) => a.estimatedCost - b.estimatedCost,
  route: (a, b) => b.scores.route - a.scores.route,
  utilization: (a, b) => b.scores.utilization - a.scores.utilization,
};

export default function OptimizationPanel({
  results,
  isLoading,
  onBookTruck,
  onViewRoute,
}) {
  const [sortBy, setSortBy] = useState('best');
  const [maxCost, setMaxCost] = useState('');
  const [truckType, setTruckType] = useState('');

  const filteredResults = useMemo(() => {
    return [...results]
      .filter((item) => (truckType ? item.truck.truckType === truckType : true))
      .filter((item) => (maxCost ? item.estimatedCost <= Number(maxCost) : true))
      .sort(sorters[sortBy] || sorters.best);
  }, [maxCost, results, sortBy, truckType]);

  const truckTypes = [...new Set(results.map((result) => result.truck.truckType))];

  return (
    <section className="space-y-5">
      <div className="panel p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Matched fleet</p>
            <h2 className="mt-2 font-heading text-3xl text-slate-950">
              {filteredResults.length} truck option(s)
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label>
              <span className="field-label">Sort</span>
              <select className="input-base" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="best">Best score</option>
                <option value="cost">Lowest cost</option>
                <option value="route">Best route fit</option>
                <option value="utilization">Highest utilization</option>
              </select>
            </label>
            <label>
              <span className="field-label">Truck type</span>
              <select className="input-base" value={truckType} onChange={(event) => setTruckType(event.target.value)}>
                <option value="">All types</option>
                {truckTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">Max budget</span>
              <input
                className="input-base"
                min="0"
                placeholder="Optional"
                type="number"
                value={maxCost}
                onChange={(event) => setMaxCost(event.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      {isLoading ? <LoadingSpinner label="Scoring truck candidates..." /> : null}

      {!isLoading && filteredResults.length === 0 ? (
        <EmptyState
          title="No trucks match this filter set"
          description="Try widening the cost threshold or removing truck type filtering."
        />
      ) : null}

      <div className="space-y-4">
        {filteredResults.map((result, index) => (
          <TruckResultCard
            key={result.truck.id}
            co2Saved={result.co2Saved}
            estimatedCost={result.estimatedCost}
            onBook={() => onBookTruck(result)}
            onViewRoute={() => onViewRoute(result)}
            rank={index + 1}
            route={result.route}
            scores={result.scores}
            truck={result.truck}
          />
        ))}
      </div>
    </section>
  );
}
