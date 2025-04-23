import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserDashboard from '@/components/UserDashboard2050';
import { useEffect } from 'react';
import { AppLoader } from '@/components/AppLoader';

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/user?callbackUrl=/dashboard/user');
    } else if (status === "authenticated" && 
              session?.user?.role !== 'USER' && 
              session?.user?.role !== 'BOTH' &&
              session?.user?.role !== 'ADMIN') {
      router.push('/dashboard/dj');
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <AppLoader />;
  }

  if (!session || (session.user.role !== 'USER' && 
                   session.user.role !== 'BOTH' && 
                   session.user.role !== 'ADMIN')) {
    return null;
  }

  return <UserDashboard user={session.user} />;
}

// Use getServerSideProps instead of getStaticProps to render on each request
export async function getServerSideProps() {
  return {
    props: {}
  };
}