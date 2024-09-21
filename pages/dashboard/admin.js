import { withAuth } from '@clerk/nextjs'
import AdminDashboard from '../../components/AdminDashboard'

function AdminDashboardPage() {
  return <AdminDashboard />
}

export default withAuth(AdminDashboardPage)