// Create a shared auth middleware for admin email endpoints
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

export async function checkAdminAuth(req, res) {
  try {
    // TEMPORARY: Allow all requests during development
    // Remove this in production
    return { isAuthorized: true };
    
    // Get the session
    const session = await getServerSession(req, res, authOptions);
    
    // For development - allow all access if NEXT_PUBLIC_DISABLE_AUTH is true
    if (process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true') {
      return { isAuthorized: true };
    }
    
    // Check if user is authenticated and is an admin
    if (!session?.user) {
      return { 
        isAuthorized: false, 
        statusCode: 401, 
        message: "Not authenticated" 
      };
    }
    
    // Allow access if user has admin role or isAdmin flag
    // Adjust based on your authentication structure
    if (!session.user.isAdmin) {
      return { 
        isAuthorized: false, 
        statusCode: 403, 
        message: "Not authorized - admin access required" 
      };
    }
    
    return { isAuthorized: true, session };
  } catch (error) {
    console.error("Auth check error:", error);
    return { 
      isAuthorized: false, 
      statusCode: 500, 
      message: "Auth check failed" 
    };
  }
} 