// Minimal plain-JS Vercel Node function — bypasses TypeScript, ESM, and dep loading.
// If this works, the runtime is healthy and the issue is in our /api/blog-generate setup.
// If this also fails, the Vercel project itself isn't recognizing /api/.
export default function handler(req, res) {
  res.status(200).json({ ok: true, runtime: process.version, time: new Date().toISOString() });
}
