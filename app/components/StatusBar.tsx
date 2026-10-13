'use client';

import { useEffect, useState } from 'react';
import { findFile } from '@/lib/ontology';

interface StatusBarProps {
  file: string | null;
  mode: string;
}

export function StatusBar({ file, mode }: StatusBarProps) {
  const [clock, setClock] = useState('--:--:--');

  useEffect(() => {
    const tick = () => {
      const t = new Date();
      const hh = String(t.getHours()).padStart(2, '0');
      const mm = String(t.getMinutes()).padStart(2, '0');
      const ss = String(t.getSeconds()).padStart(2, '0');
      setClock(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const f = file ? findFile(file) : null;

  return (
    <footer className="status">
      <span className="mode">{mode}</span>
      <span>≡ main</span>
      <span className="sep" />
      <span>Ln 1, Col 1</span>
      <span className="sep" />
      <span>{f ? `${f.lines} lines` : '2 lines'}</span>
      <span className="sep" />
      <span>UTF-8</span>
      <span className="sep" />
      <span>{f ? f.lang : 'typescript'}</span>
      <span className="ready">
        ready · <span>{clock}</span>
      </span>
    </footer>
  );
}
