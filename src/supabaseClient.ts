import { createClient } from '@supabase/supabase-js';

const meta = import.meta as any;
const supabaseUrl = meta.env?.VITE_SUPABASE_URL || 'https://eppfdvsqduanoonpfflb.supabase.co';
const supabaseAnonKey = meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_LlGu9ul-RHbTXhU72r5p6A_U2Zwzpd3';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
