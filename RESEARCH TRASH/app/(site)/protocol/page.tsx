// Legacy redirect — /protocol is no longer a separate route.
// The Protocol Node now lives at the root; these stylesheets are imported by
// the root page so they still ship.
import "./protocol.css";
import "./console.css";

export default function ProtocolNodePage() {
  return null;
}
