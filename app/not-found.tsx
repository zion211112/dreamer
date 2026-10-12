export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--bg)] text-[var(--fg)]">
      <div className="text-center p-8">
        <h1 className="text-6xl font-display font-semibold mb-4">404</h1>
        <p className="text-[var(--fg-muted)] text-lg">Page not found</p>
        <a
          href="/"
          className="mt-6 inline-block text-[var(--accent-hi)] hover:text-[var(--accent)] transition-colors"
        >
          Return to workspace
        </a>
      </div>
    </div>
  );
}