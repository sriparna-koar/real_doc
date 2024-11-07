
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { v4 as uuidv4 } from 'uuid';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid profile email',
          prompt: 'select_account',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  jwt: {
    encryption: true,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token-${uuidv4()}`, // Default token name
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      session.tabSessionId = token.tabSessionId;
      return session;
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        token.tabSessionId = account.tabSessionId;
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
