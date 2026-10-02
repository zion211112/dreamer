// Legacy redirect — /protocol is no longer a separate route.
// The Protocol Node now lives at the root; protocol.css is imported by
// the root page so the stylesheet still ships.
import "./protocol.css";

export default function ProtocolNodePage() {
  return null;
}
