import { CompanyWorkspace } from "@/components/site/CompanyWorkspace";

/**
 * One navigable company workspace shared by portfolio, system, and evidence routes.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CompanyWorkspace>{children}</CompanyWorkspace>;
}