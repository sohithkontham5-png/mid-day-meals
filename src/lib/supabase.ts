import { createClient, SupabaseClient } from '@supabase/supabase-js';

const CONFIG_KEY = 'mdm_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  enabled: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to get Supabase config', e);
  }
  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    enabled: Boolean(import.meta.env.VITE_SUPABASE_URL),
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(config.url, config.anonKey);
  }
  return supabaseInstance;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = createClient(url, anonKey);
    const { data, error } = await client.from('schools').select('id, name').limit(1);
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: `Connected successfully! School: ${data?.[0]?.name || 'Database reached'}` };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed' };
  }
}
