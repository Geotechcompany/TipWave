import { getAuth } from "@clerk/nextjs/server";

export function withAuth(Component, { requireAdmin = false } = {}) {
  return function AuthenticatedComponent(props) {
    const { isLoaded, isSignedIn, user } = getAuth();

    if (!isLoaded) {
      return null; // or loading spinner
    }

    if (!isSignedIn) {
      // Redirect to sign in if not authenticated
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
      return null;
    }

    if (requireAdmin && user?.publicMetadata?.role !== 'admin') {
      // Redirect to user dashboard if not an admin
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard/user';
      }
      return null;
    }

    return <Component {...props} />;
  };
} 