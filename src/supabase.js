import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ehnguyuzpffqzaednrnn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobmd1eXV6cGZmcXphZWRucm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NDg3NzEsImV4cCI6MjA2MjIyNDc3MX0.QEVLtwo9IDJgt7uCy646evKoTZRLVYxwmhemTXdr_Xw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
