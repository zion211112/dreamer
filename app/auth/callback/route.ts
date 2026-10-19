import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';
import { safeReturnPath } from '@/lib/supabase/urls';
import { getWorkspaceContext } from '@/lib/workspace-access';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const destination = safeReturnPath(request.nextUrl.searchParams.get('next') ?? '/workspace');
  if (!code) return NextResponse.redirect(new URL('/sign-in?error=missing-code', request.url));
  if (!hasSupabaseConfiguration()) return NextResponse.redirect(new URL('/sign-in?error=configuration', request.url));
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL('/sign-in?error=exchange-failed', request.url));
  const context = await getWorkspaceContext();
  if (!context.authenticated) return NextResponse.redirect(new URL('/sign-in?error=session-failed', request.url));
  const defaultWorkspaceParams = new URLSearchParams({
    context: context.defaultContextKey,
    view: 'assets',
  });
  const finalDestination = destination === '/workspace' ? `/workspace?${defaultWorkspaceParams.toString()}` : destination;
  return NextResponse.redirect(new URL(finalDestination, request.url));
}
