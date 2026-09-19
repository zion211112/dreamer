// Every console route (/console, /console/[id], ...) is open.
// All gates removed: no name lock, no paywall reaches the console.
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
