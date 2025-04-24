import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const requireAuth = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return false;
  }
  return true;
};

// Helper function to check if user has DJ role
export const isDj = (user) => {
  return user?.role === 'DJ' || user?.role === 'BOTH' || user?.role === 'ADMIN';
};

// Helper function to check if user has Admin role
export const isAdmin = (user) => {
  return user?.role === 'ADMIN' || user?.isAdmin === true;
};