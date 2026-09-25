import Link from "next/link";
import { faceMetadata } from "../../../lib/metadata";
import "../../identity.css";

export const metadata = faceMetadata({
  title: "The posture",
  description:
    "Why APT-LABS builds the way it does: locally owned, offline, and reproducible — and what is still unknown.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main className="site-page identity-page">
      <div className="site-frame">
        <p className="site-kicker">About · APT-LABS</p>
        <h1 className="page-title">Built to be kept.</h1>
        <p className="identity-lead">
          We build systems that institutions can own — software, hardware, and the
          people who can run them — without leaning on a network, a subscription, or us.
        </p>
        <p className="identity-lead about-body">
          Most of it is still being made. What exists today is a working local
          prototype; the rest arrives one bounded piece at a time, and we name the
          difference between the two.
        </p>
        <div className="identity-actions">
          <Link className="site-action" href="/evidence">
            What exists today <span aria-hidden="true">→</span>
          </Link>
          <Link className="site-action-secondary" href="/contact">
            Say hello
          </Link>
        </div>
      </div>
    </main>
  );
}
