import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DJDashboard from '@/components/DJDashboard';
import { useEffect } from 'react';
import { AppLoader } from '@/components/AppLoader';

export default function DJDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/dj?callbackUrl=/dashboard/dj');
    } else if (status === "authenticated" && 
              session?.user?.role !== 'DJ' && 
              session?.user?.role !== 'BOTH' &&
              session?.user?.role !== 'ADMIN') {
      router.push('/dashboard/user');
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <AppLoader />;
  }

  if (!session || (session.user.role !== 'DJ' && 
                   session.user.role !== 'BOTH' && 
                   session.user.role !== 'ADMIN')) {
    return null;
  }

  return <DJDashboard user={session.user} />;
}