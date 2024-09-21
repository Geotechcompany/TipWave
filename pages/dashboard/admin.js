import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect } from "react";
import AdminDashboard from "../../components/AdminDashboard";

function AdminDashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return null; // or a loading spinner
  }

  // You might want to add an additional check here to ensure the user is an admin
  // For example:
  // if (user.publicMetadata.role !== 'admin') {
  //   router.push('/dashboard/user');
  //   return null;
  // }

  return <AdminDashboard />;
}

export default AdminDashboardPage;
