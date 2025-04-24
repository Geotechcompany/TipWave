import UserDashboard2050 from '@/components/UserDashboard2050';
import { CurrencyProvider } from '@/context/CurrencyContext';

export default function DashboardPage() {
  return (
    <CurrencyProvider>
      <UserDashboard2050 />
    </CurrencyProvider>
  );
} 