import { withAuth } from '@clerk/nextjs'
import UserDashboard from '../../components/UserDashboard'

function UserDashboardPage() {
  return <UserDashboard />
}

export default withAuth(UserDashboardPage)