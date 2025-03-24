import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect } from "react";
import AdminDashboard from "../../components/AdminDashboard";

function AdminPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (isLoaded && isSignedIn && user?.publicMetadata?.role !== 'admin') {
      router.push("/dashboard/user");
      return;
    }
  }, [isLoaded, isSignedIn, router, user]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return <AdminDashboard />;
}

export default AdminPage;
