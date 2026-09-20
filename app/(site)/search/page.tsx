import { redirect } from "next/navigation";

// The roll already carries a working filter — press "/" anywhere on /ledger to
// focus it. Rather than ship a search box that apologizes for having no index,
// send people where the query actually resolves.
export default function Search() {
  redirect("/ledger");
}
