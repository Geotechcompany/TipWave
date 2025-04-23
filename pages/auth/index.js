import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthPage from "@/components/auth/AuthPage";
import { useSession } from "next-auth/react";

export default function Auth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated, redirect to appropriate dashboard
    if (status === "authenticated") {
      if (session?.user?.role === "ADMIN") {
        router.push("/dashboard/admin");
      } else if (session?.user?.role === "DJ") {
        router.push("/dashboard/dj");
      } else {
        router.push("/dashboard/user");
      }
    }
  }, [status, session, router]);

  return <AuthPage />;
} 