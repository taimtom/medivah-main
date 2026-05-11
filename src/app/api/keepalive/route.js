import { createServerClient } from 'src/lib/supabase/server';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const supabase = createServerClient();
    await supabase.from('blogs').select('id').limit(1);
    return Response.json({ ok: true, ts: new Date().toISOString() });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
