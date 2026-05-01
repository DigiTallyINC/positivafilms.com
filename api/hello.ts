// Diagnostic endpoint — confirms Vercel functions are running at all.
// No imports, no env vars, no auth. If GET /api/hello returns 200, the
// runtime is healthy and we know the issue is in blog-generate's deps.

export default function handler() {
  return new Response(
    JSON.stringify({ ok: true, runtime: process.version, time: new Date().toISOString() }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}
