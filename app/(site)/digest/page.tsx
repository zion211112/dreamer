import { redirect } from "next/navigation";

// The questionnaire is retired. Keep old bookmarks useful.
export default function DigestPage() {
  redirect("/console/11");
}
