import { getAuth } from "@clerk/nextjs/server";
import DJDashboard from '../../components/DJDashboard'

function DJDashboardPage() {
  return <DJDashboard />
}

export default DJDashboardPage

export const getServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  
  if (!userId) {
    return {
      redirect: {
        destination: '/sign-in?redirect_url=/dashboard/dj',
        permanent: false,
      },
    }
  }

  return { 
    props: {} 
  };
};