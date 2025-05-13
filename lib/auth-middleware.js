import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function checkAdminAuth(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
      return {
        isAuthorized: false,
        statusCode: 401,
        message: 'Unauthorized - Please login'
      };
    }

    // Check if user has admin role
    if (!session.user.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return {
        isAuthorized: false,
        statusCode: 403,
        message: 'Forbidden - Admin access required'
      };
    }

    return {
      isAuthorized: true,
      user: session.user
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return {
      isAuthorized: false,
      statusCode: 500,
      message: 'Authentication check failed'
    };
  }
} 