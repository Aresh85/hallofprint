import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type PriceMatchRequest = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string;
  product_name: string;
  quantity: string;
  competitor_name: string;
  competitor_price: string;
  competitor_url: string;
  additional_info?: string;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
};
