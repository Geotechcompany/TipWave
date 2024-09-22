import { getAuth } from "@clerk/nextjs/server";

export const requireAuth = async (req) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return false;
  }
  return true;
};