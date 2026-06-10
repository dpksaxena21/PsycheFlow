import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://uckgvukjdekoxfbxnqew.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVja2d2dWtqZGVrb3hmYnhucWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDUwMDgsImV4cCI6MjA5MzgyMTAwOH0.aLg6UsrfkBBIv_fJyraMa9xtBFNS6_BkGFiTX_vfVYA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
