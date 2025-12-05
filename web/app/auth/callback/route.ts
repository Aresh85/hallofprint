import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    await supabase.auth.exchangeCodeForSession(code);
    
    // Get user profile to determine redirect
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      // Redirect based on role
      if (profile?.role === 'operator' || profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/price-match-dashboard', requestUrl.origin));
      }
    }
  }

  // Default redirect to account page
  return NextResponse.redirect(new URL('/account', requestUrl.origin));
}
