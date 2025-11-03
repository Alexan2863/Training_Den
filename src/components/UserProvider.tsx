"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AuthUser } from "../lib/auth";
import { createClient } from "../lib/supabase/client";

const UserContext = createContext<AuthUser | null>(null);

interface UserProviderProps {
  initialUser: AuthUser | null;
  children: ReactNode;
}

export function UserProvider({ initialUser, children }: UserProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  // Create client once - createClient() is a lazy singleton so it's safe to call
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Fetch full user profile when signed in
        if (session?.user) {
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          setUser(profile ? (profile as AuthUser) : null);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
