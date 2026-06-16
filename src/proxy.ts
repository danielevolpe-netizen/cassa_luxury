import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Next.js 16 "proxy" (ex middleware): protegge le rotte tramite il callback
// `authorized`. Usa solo la config edge-safe (nessun db/bcrypt).
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Esclude API auth, asset statici e file pubblici.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
