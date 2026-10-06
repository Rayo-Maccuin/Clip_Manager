"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AuthUser } from "@/lib/auth";

const AuthUserContext = createContext<AuthUser | null>(null);

export function AuthUserProvider({
  user,
  children,
}: {
  user: AuthUser | null;
  children: ReactNode;
}) {
  return <AuthUserContext.Provider value={user}>{children}</AuthUserContext.Provider>;
}

export function useAuthUser() {
  return useContext(AuthUserContext);
}