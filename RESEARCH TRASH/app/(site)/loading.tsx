export default function Loading() {
  return (
    <main className="site-page bg-void text-ink" aria-busy="true">
      <div className="site-frame site-frame--narrow">
        <span className="sr-only">Loading the record</span>
        <div className="skeleton h-6 w-40" />
        <div className="skeleton mt-6 h-12 w-[min(100%,28rem)]" />
        <div className="skeleton mt-4 h-4 w-[min(100%,34rem)]" />
      </div>
    </main>
  );
}