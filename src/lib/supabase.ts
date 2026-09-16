import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://dtmcbzrktnrjnrsjgiyf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bWNienJrdG5yam5yc2pnaXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MTcwMDUsImV4cCI6MjEwNTA5MzAwNX0.9x8qmHCAIcVjbceJZ684pzzqRlsvXjyA2jY0oJXlPHA';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
