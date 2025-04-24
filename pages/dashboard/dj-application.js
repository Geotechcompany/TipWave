import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from 'react';
import DJApplicationForm from '@/components/DJApplicationForm';
import { AppLoader } from '@/components/AppLoader';

export default function DJApplicationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log("DJ Application Page - Auth Status:", status);
    console.log("DJ Application Page - Session:", session);
    
    if (status === "unauthenticated") {
      console.log("Redirecting to login - user is unauthenticated");
      router.push('/auth/user?callbackUrl=/dashboard/dj-application');
    } else if (status === "authenticated" && 
              (session.user.role === 'DJ' || 
               session.user.role === 'ADMIN' || 
               session.user.role === 'BOTH')) {
      console.log("Redirecting to DJ dashboard - user already has DJ role:", session.user.role);
      router.push('/dashboard/dj');
    } else {
      console.log("Showing DJ application form - user is:", session?.user?.email, "with role:", session?.user?.role);
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <AppLoader />;
  }

  if (!session) {
    return null;
  }

  return <DJApplicationForm />;
} 