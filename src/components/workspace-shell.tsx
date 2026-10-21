'use client';

import { useEffect, useRef, useState } from 'react';

export function WorkspaceShell() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/workspace-shell.html', { cache: 'force-cache' });
        if (!response.ok) throw new Error(`Failed to load workspace shell (${response.status})`);
        const html = await response.text();
        if (cancelled) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const styleNodes = Array.from(doc.querySelectorAll('style'));
        const styleHtml = styleNodes.map(node => node.outerHTML).join('\n');
        const bodyHtml = doc.body ? doc.body.innerHTML : '';
        const scriptCodes = Array.from(doc.querySelectorAll('script')).map(s => s.textContent || '');

        container.innerHTML = `${styleHtml}\n${bodyHtml}`;

        for (const code of scriptCodes) {
          if (!code.trim()) continue;
          const script = document.createElement('script');
          script.textContent = code;
          container.appendChild(script);
        }

        setStatus('ready');
      } catch (error) {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="workspace-shell-host">
      {status === 'loading' && (
        <div className="workspace-shell-status" role="status">
          Loading workspace…
        </div>
      )}
      {status === 'error' && (
        <div className="workspace-shell-status" role="alert">
          The workspace shell could not be loaded. Refresh to try again.
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
}
