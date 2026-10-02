import { redirect } from "next/navigation";

// The Protocol Node now lives at the root. /protocol remains as a stable
// deep link and redirects there.
export default function ProtocolNodeLayout() {
  redirect("/");
}
