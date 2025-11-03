import { createBrowserClient } from "@supabase/ssr";

// Lazy singleton: create once, reuse forever to avoid multiple instances
let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (clientInstance) {
    return clientInstance;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }

  clientInstance = createBrowserClient(url, key);
  return clientInstance;
}
