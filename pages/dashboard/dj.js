import { withAuth } from '@clerk/nextjs'
import DJDashboard from '../../components/DJDashboard'

function DJDashboardPage() {
  return <DJDashboard />
}

export default withAuth(DJDashboardPage)