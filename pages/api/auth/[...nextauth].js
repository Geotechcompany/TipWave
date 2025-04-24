import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail, createUser } from "@/lib/models/user";
import bcrypt from "bcryptjs";
import { getSession } from "next-auth/react";
import { generateDefaultAvatar } from '@/lib/avatar';
import clientPromise from '@/lib/mongodb';
import { sendNotificationEmail, EmailTypes } from '@/lib/email';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
        name: { label: "Name", type: "text" },
        isRegistering: { label: "Is Registering", type: "boolean" }
      },
      async authorize(credentials) {
        try {
          // Handle registration
          if (credentials.isRegistering === "true") {
            const existingUser = await findUserByEmail(credentials.email);
            if (existingUser) {
              throw new Error("User already exists");
            }

            // Log the password before hashing
            console.log("Password before hashing:", credentials.password);
            
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            
            // Log the hashed password
            console.log("Hashed password:", hashedPassword);

            const newUser = await createUser({
              email: credentials.email,
              password: hashedPassword,
              name: credentials.name || 'Anonymous',
              role: credentials.role || 'USER'
            });

            // Log the created user (without sensitive data)
            console.log("Created user:", {
              id: newUser.id,
              email: newUser.email,
              role: newUser.role
            });

            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              role: newUser.role
            };
          }

          // Handle sign in
          const user = await findUserByEmail(credentials.email);
          
          if (!user) {
            console.log("User not found:", credentials.email);
            throw new Error("Invalid credentials");
          }

          // Debug logs
          console.log("Found user:", {
            id: user.id,
            email: user.email,
            role: user.role,
            passwordExists: !!user.password,
            passwordLength: user.password?.length
          });

          // Ensure password exists
          if (!user.password) {
            console.error("No password hash found for user");
            throw new Error("Invalid user data");
          }

          try {
            // Remove any potential whitespace from stored hash
            const cleanHash = user.password.trim();
            
            // Log the exact values being compared
            console.log("Comparing passwords:", {
              inputLength: credentials.password.length,
              hashLength: cleanHash.length,
              input: credentials.password,
              hash: cleanHash
            });

            // Compare passwords without trim on input
            const isValid = await bcrypt.compare(
              credentials.password,
              cleanHash
            );

            console.log("Password comparison result:", isValid);

            if (!isValid) {
              console.log("Invalid password for user:", credentials.email);
              throw new Error("Invalid credentials");
            }

            // For admin login, verify role
            if (credentials.role === 'ADMIN' && user.role !== 'ADMIN') {
              throw new Error("Not authorized as admin");
            }

            // Return user without sensitive data
            const authenticatedUser = {
              id: user.id || user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role
            };

            console.log("Authentication successful:", authenticatedUser);
            return authenticatedUser;

          } catch (error) {
            console.error("Password comparison error:", error);
            throw new Error("Invalid credentials");
          }
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/user',
    error: '/auth/error'
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Existing admin check
      if (url.includes('/dashboard/admin')) {
        const session = await getSession();
        if (!session?.user) {
          return `${baseUrl}/auth/admin`;
        } else if (session?.user?.role !== 'ADMIN') {
          return `${baseUrl}/auth`;
        }
      }

      // Add DJ dashboard check
      if (url.includes('/dashboard/dj')) {
        const session = await getSession();
        if (!session?.user) {
          return `${baseUrl}/auth/dj`;
        } else if (session?.user?.role !== 'DJ' && 
                   session?.user?.role !== 'BOTH' && 
                   session?.user?.role !== 'ADMIN') {
          return `${baseUrl}/auth`;
        }
      }
      
      // Fix the User dashboard check - redirect properly when wrong role
      if (url.includes('/dashboard/user')) {
        const session = await getSession();
        if (!session?.user) {
          return `${baseUrl}/auth/user`;
        } else if (session?.user?.role !== 'USER' && 
                   session?.user?.role !== 'BOTH' && 
                   session?.user?.role !== 'ADMIN') {
          // Redirect to the appropriate dashboard instead of always DJ dashboard
          if (session?.user?.role === 'DJ') {
            return `${baseUrl}/dashboard/dj`;
          } else {
            return `${baseUrl}/auth/user`; // Fallback to user login
          }
        }
      }
      
      // Existing redirect logic
      if (url.startsWith(baseUrl)) {
        const session = await getSession();
        // Admin can access any dashboard, make sure not to redirect them
        if (session?.user?.role === 'ADMIN') {
          // If the URL already contains a dashboard path, keep it as is
          if (url.includes('/dashboard/')) {
            return url;
          }
          return `${baseUrl}/dashboard/admin`;
        } else if (session?.user?.role === 'DJ') {
          return `${baseUrl}/dashboard/dj`;
        }
        return `${baseUrl}/dashboard/user`;
      }
      return url;
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Log the additional parameters for debugging purposes
      console.log("Profile data:", profile);
      console.log("Email info:", email);
      console.log("Credentials data:", credentials);
      
      // Use your findUserByEmail function instead of Prisma
      const dbUser = await findUserByEmail(user.email);
      
      // Check if user exists
      if (!dbUser) {
        return false;
      }
      
      // Check if account is deactivated
      if (dbUser.status === 'inactive') {
        throw new Error('ACCOUNT_DEACTIVATED');
      }
      
      // For OAuth providers, check if user needs an avatar
      if (account.provider === 'google' || account.provider === 'github') {
        // These providers already have avatars, so we don't need to generate one
        return true;
      }
      
      // For email/password, we might need to generate an avatar
      if (account.provider === 'credentials' && !user.image) {
        const avatar = generateDefaultAvatar({ name: user.name, email: user.email });
        
        // Update user with avatar in database
        const client = await clientPromise;
        const db = client.db();
        await db.collection('users').updateOne(
          { email: user.email },
          { $set: { image: avatar } }
        );
        
        // Add image to the user object for this session
        user.image = avatar;
      }
      
      // Send welcome email for new registrations
      if (account.provider === 'credentials' && credentials?.isRegistering === "true") {
        try {
          await sendNotificationEmail({
            to: user.email,
            type: EmailTypes.USER_WELCOME,
            data: {
              userName: user.name || user.email.split('@')[0]
            }
          });
          console.log(`Welcome email sent to ${user.email}`);
        } catch (error) {
          console.error('Failed to send welcome email:', error);
          // Don't block sign-in if email fails
        }
      }
      
      return true;
    }
  },
};

export default NextAuth(authOptions); 