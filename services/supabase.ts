import { createClient } from '@supabase/supabase-js';

// Substitua pelos dados do seu projeto Supabase
const SUPABASE_URL = "https://dotmyxqrqupqdrqmbppg.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdG15eHFycXVwcWRycW1icHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDM2NjMsImV4cCI6MjA3MzYxOTY2M30.ciPTtX3CwnsFm7Z-VBMO2uLZzoy07J0rlET8IYYJG44"

// Cria a conexão com Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
