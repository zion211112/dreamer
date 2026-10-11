'use client';

import { useState, useEffect, useRef } from 'react';

const PROMPTS: Record<string, string[]> = {
  workspace: [
    'What is the system status?',
    'Show me the kernel',
    'Open teacher console',
  ],
  foundation: [
    'How are SBTs issued?',
    'Who anchors credentials?',
    'Show verification flow',
  ],
  products: [
    'Open teacher console',
    'Open school console',
    'What builds are live?',
  ],
  design: [
    'Show design tokens',
    'What motion tokens exist?',
  ],
  operations: [
    'Deploy status?',
    'Latest alerts?',
  ],
  laboratory: [
    'Run experiment',
    'Latest research?',
  ],
};

interface Message {
  id: number;
  role: 'user' | 'agent';
  text: string;
}

export function ChatAgent({ activeModule }: { activeModule: string | null }) {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'agent', text: 'Control surface online. Ask me about the system.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  const prompts = PROMPTS[activeModule ?? 'workspace'] || PROMPTS.workspace;

  useEffect(() => {
    if (avatarRef.current) {
      avatarRef.current.style.animation = 'pulse 2s infinite';
      return () => {
        if (avatarRef.current) avatarRef.current.style.animation = '';
      };
    }
  }, []);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: trimmed }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [
        ...prev.slice(-8),
        {
          id: Date.now() + 1,
          role: 'agent',
          text: 'Acknowledged — routing through the ' + (activeModule ?? 'workspace') + ' surface.',
        },
      ]);
    }, 900 + Math.random() * 700);
  };

  return (
    <div
      className="flex flex-col w-60 rounded-xl border hairline overflow-hidden"
      style={{
        background: 'var(--surface)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
      }}
    >
      {/* header */}
      <div className="flex items-center justify-between px-3 py-2 border-b hairline">
        <div className="flex items-center gap-2">
          <div
            ref={avatarRef}
            className="w-6 h-6 rounded-md flex items-center justify-center text-[11px]"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
              boxShadow: '0 0 10px rgba(124,108,255,0.5)',
            }}
          >
            ⌘
          </div>
          <span className="text-[11px] font-semibold text-[var(--fg)]">agent</span>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-[var(--success)] animate-pulse-subtle" />
          </span>
        </div>
        <button
          onClick={() => setIsOpen(v => !v)}
          className="text-[var(--fg-faint)] hover:text-[var(--fg)] text-[13px] leading-none px-1"
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>

      {isOpen && (
        <>
          {/* messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 max-h-44 min-h-[72px] scrollbar-thin">
            {messages.map(m => (
              <div
                key={m.id}
                className={'text-[10.5px] leading-relaxed rounded-md px-2 py-1.5 ' +
                  (m.role === 'user'
                    ? 'bg-[var(--accent-soft)] text-[var(--fg)]'
                    : 'bg-[var(--border)] text-[var(--fg-muted)]')}
              >
                {m.text}
              </div>
            ))}
            {typing && (
              <div className="flex items-center gap-1 px-2 py-1.5">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-[var(--fg-faint)] animate-pulse-subtle"
                    style={{ animationDelay: i * 0.2 + 's' }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* contextual prompts */}
          <div className="px-2 pb-1.5 flex flex-wrap gap-1">
            {prompts.slice(0, 3).map(p => (
              <button
                key={p}
                onClick={() => send(p)}
                className="text-[9.5px] px-1.5 py-0.5 rounded border hairline text-[var(--fg-faint)] hover:text-[var(--fg)] hover:border-[var(--border-strong)] transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* input */}
          <div className="px-2 pb-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(input); }}
              placeholder="ask the system…"
              className="w-full bg-[var(--bg)] border hairline rounded-md px-2 py-1 text-[10.5px] text-[var(--fg)] placeholder-[var(--fg-faint)] outline-none focus:border-[var(--accent)]"
            />
          </div>
        </>
      )}
    </div>
  );
}
