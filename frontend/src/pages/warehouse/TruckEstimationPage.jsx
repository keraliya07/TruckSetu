import DashboardShell from '../../components/common/DashboardShell';
import PageTabs from '../../components/common/PageTabs';
import TruckFitCalculator from '../../components/optimization/TruckFitCalculator';
import { useAuth } from '../../hooks/useAuth';

export default function TruckEstimationPage() {
  const { user } = useAuth();

  return (
    <DashboardShell
      accent="text-freight-600"
      eyebrow="Warehouse Flow"
      title="Truck estimation"
      subtitle="Check likely truck fit, price range, emissions, and live availability before you commit anything to the shipment workflow."
    >
      <PageTabs
        items={[
          { to: '/warehouse/shipments', label: 'Shipment board' },
          { to: '/warehouse/shipments/history', label: 'Shipment history' },
          { to: '/warehouse/shipments/new', label: 'Create workspace' },
          { to: '/warehouse/bookings', label: 'Bookings' },
          { to: '/warehouse/truck-estimation', label: 'Truck estimation', active: true },
        ]}
      />

      <TruckFitCalculator defaultOriginCity={user?.warehouse?.city} />
    </DashboardShell>
  );
}
