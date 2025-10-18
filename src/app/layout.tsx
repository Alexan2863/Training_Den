import { ReactNode } from "react";
import "./globals.css";
import { createClient } from "../lib/supabase/server";
import { AuthUser } from "../lib/auth";
import { UserProvider } from "../components/UserProvider";
import LayoutWrapper from "../components/LayoutWrapper";

export const metadata = {
  title: "Training Den",
  description: "A Compliance Training Tracking Application",
};

interface RootLayoutProps {
  children: ReactNode;
}

async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) return null;

    return profile as AuthUser;
  } catch (error) {
    return null;
  }
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <UserProvider initialUser={user}>
          <LayoutWrapper>{children}</LayoutWrapper>
        </UserProvider>
      </body>
    </html>
  );
}
