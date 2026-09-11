import { permanentRedirect } from "next/navigation";

// The jobs board moved to /benben/jobs. This alias stays for 30 days,
// then the route is removed. Update your bookmarks to the floor.
export default function WorkRedirect() {
  permanentRedirect("/benben/jobs");
}
