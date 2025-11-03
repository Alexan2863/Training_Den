import { createBrowserClient } from "@supabase/ssr";

// Singleton: create once at module initialization to prevent race conditions
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!url || !key) {
  throw new Error("Missing Supabase environment variables");
}

const clientInstance = createBrowserClient(url, key);

export function createClient() {
  return clientInstance;
}
