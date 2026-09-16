import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://foefhwbkfwqfieopnfub.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvZWZod2JrZndxZmllb3BuZnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczODE4MDMsImV4cCI6MjEwMjk1NzgwM30.I8ySs8DuOzFZZLa0ilYxvAaZBALXZU7LjNP8e5T6CXw';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
