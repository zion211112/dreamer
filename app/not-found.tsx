import Link from "next/link";
import { Navigation } from "@/components/site/Navigation";
import { Footer } from "@/components/site/Footer";

export default function NotFound() {
  return (
    <>
      <Navigation />
      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="container text-center">
          <h1 className="text-6xl font-display font-bold text-white mb-4">404</h1>
          <p className="text-xl text-neutral-300 mb-8">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}