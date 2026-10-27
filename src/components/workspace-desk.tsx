'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon, LayoutDashboard, FolderOpen, FileText, Settings } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface WorkspaceDeskProps {
  initialTenders: unknown[];
  initialBriefs: unknown[];
  userEmail: string;
  profileData: unknown;
  localMode: boolean;
  workspaceContexts: unknown;
}

export function WorkspaceDesk({
  initialTenders,
  initialBriefs,
  userEmail,
  profileData,
  localMode,
  workspaceContexts,
}: WorkspaceDeskProps) {
  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/workspace', icon: LayoutDashboard },
    { label: 'Tenders', href: '/tenders', icon: FolderOpen },
    { label: 'Briefs', href: '/commons', icon: FileText },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="workspace-desk h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">APT-LABS Workspace</h1>
            {localMode && (
              <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                Local Dev Mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{userEmail}</span>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-out">Sign out</Link>
            </Button>
          </div>
        </div>
        <nav className="border-t px-4 flex gap-1" role="navigation" aria-label="Workspace navigation">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              size="sm"
              className="h-10 px-3"
              asChild
            >
              <Link href={item.href} className="flex items-center gap-2">
                <item.icon size={16} />
                <span>{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle>Welcome to the Studio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This is the APT-LABS workspace. Coordinate tenders, review briefs, and build sovereign infrastructure.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-2">Active Tenders</h3>
                    <p className="text-3xl font-bold">{initialTenders.length}</p>
                    <p className="text-sm text-muted-foreground">Available in the market</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-2">Problem Briefs</h3>
                    <p className="text-3xl font-bold">{initialBriefs.length}</p>
                    <p className="text-sm text-muted-foreground">In the commons library</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-2">Mode</h3>
                    <p className="text-3xl font-bold">{localMode ? 'Local Dev' : 'Network'}</p>
                    <p className="text-sm text-muted-foreground">Authentication context</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <Link href="/tenders">Browse Tenders</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/commons/contribute">Submit a Brief</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/assembly">View Assemblies</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t p-4 bg-card/50">
        <div className="container mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span>APT-LABS — Sovereign Coordination Engine</span>
          <span>#coordination-is-infrastructure</span>
        </div>
      </footer>
    </div>
  );
}
