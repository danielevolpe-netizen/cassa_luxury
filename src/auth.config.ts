import type { NextAuthConfig } from "next-auth";

// Configurazione base, sicura per l'edge runtime (middleware): nessun accesso
// al database né a moduli Node. La logica di login (db + bcrypt) sta in auth.ts.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isOnLogin) {
        // Se già loggato, dalla pagina di login rimanda alla dashboard.
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // Tutto il resto richiede autenticazione.
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "collaboratore";
      }
      return session;
    },
  },
  providers: [], // i provider veri sono aggiunti in auth.ts
} satisfies NextAuthConfig;
