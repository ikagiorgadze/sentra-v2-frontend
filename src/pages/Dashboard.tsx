import { useSearchParams } from "react-router-dom";
import PendingDashboard from "@/components/dashboard/PendingDashboard";
import ActiveDashboard from "@/components/dashboard/ActiveDashboard";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const isPending = searchParams.get('state') === 'pending';

  if (isPending) {
    return <PendingDashboard />;
  }

  return <ActiveDashboard />;
};

export default Dashboard;
