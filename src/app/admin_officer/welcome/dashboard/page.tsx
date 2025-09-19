import DashboardClient from './DashboardClient';

/**
 * Main Dashboard Page Component (Server Component)
 */
export default function DashboardPage() {
  // The DashboardClient component is now responsible for fetching its own data.
  return <DashboardClient />;
}