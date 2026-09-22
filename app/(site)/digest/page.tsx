import { redirect } from "next/navigation";

// The questionnaire was retired, and the console seat behind it was cut with
// the grid — so an old bookmark lands at the front door instead of a 404.
export default function DigestPage() {
  redirect("/");
}
