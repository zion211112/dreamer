'use client';

import { useEffect, useState } from 'react';

export function TerminalCursor() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  return <span className={`term-cursor ${visible ? 'visible' : ''}`} aria-hidden="true">_</span>;
}
