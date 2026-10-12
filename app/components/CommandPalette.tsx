'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { filterCommands, CommandContext } from '@/lib/commands';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  context: CommandContext;
}

// Agent prefix marker
const AGENT_PREFIX = 'agent:';

interface Message {
  id: number;
  role: 'user' | 'agent';
  text: string;
}

const PROMPTS: Record<string, string[]> = {
  workspace: [
    'What is the system status?',
    'Show me the kernel',
    'Open teacher console',
  ],
  kernel: [
    'How are SBTs issued?',
    'Who anchors credentials?',
    'Show verification flow',
  ],
  network: [
    'List accredited schools',
    'Show teacher reputations',
    'List anchors',
  ],
  builds: [
    'Open teacher console',
    'Open school console',
    'What builds are live?',
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

function ChatInterface({ activeModule, onClose }: { activeModule: string | null; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'agent', text: 'Control surface online. Ask me about the system.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const prompts = PROMPTS[activeModule ?? 'workspace'] || PROMPTS.workspace;

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 0);
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
    <div className="flex flex-col">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-2 border-b hairline">
        <div className="flex items-center gap-2">
          <div
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
          onClick={onClose}
          className="text-[var(--fg-faint)] hover:text-[var(--fg)] text-[13px] leading-none px-1"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 max-h-[280px] min-h-[120px] scrollbar-thin">
        {messages.map(m => (
          <div
            key={m.id}
            className={'text-[11px] leading-relaxed rounded-md px-3 py-2 ' +
              (m.role === 'user'
                ? 'bg-[var(--accent-soft)] text-[var(--fg)]'
                : 'bg-[var(--border)] text-[var(--fg-muted)]')}
          >
            {m.text}
          </div>
        ))}
        {typing && (
          <div className="flex items-center gap-1 px-3 py-2">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[var(--fg-faint)] animate-pulse-subtle"
                style={{ animationDelay: i * 0.2 + 's' }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contextual prompts */}
      <div className="px-4 pb-2 flex flex-wrap gap-1.5 border-t hairline">
        {prompts.slice(0, 4).map(p => (
          <button
            key={p}
            onClick={() => send(p)}
            className="text-[9.5px] px-2 py-1 rounded border hairline text-[var(--fg-faint)] hover:text-[var(--fg)] hover:border-[var(--border-strong)] transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t hairline">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(input); if (e.key === 'Escape') onClose(); }}
          placeholder="ask the system…"
          className="w-full bg-[var(--bg)] border hairline rounded-md px-3 py-1.5 text-[11px] text-[var(--fg)] placeholder-[var(--fg-faint)] outline-none focus:border-[var(--accent)]"
        />
      </div>
    </div>
  );
}

export function CommandPalette({ isOpen, onClose, context }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Check if query starts with agent:
  const isAgentMode = query.trim().toLowerCase().startsWith(AGENT_PREFIX);
  const agentQuery = isAgentMode ? query.trim().slice(AGENT_PREFIX.length).trim() : '';

  const filteredCommands = useMemo(
    () => isAgentMode ? [] : filterCommands(query, context),
    [query, context, isAgentMode]
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement | undefined;
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        if (!isAgentMode) {
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
        }
        break;
      case 'ArrowUp':
        if (!isAgentMode) {
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
        }
        break;
      case 'Enter':
        if (!isAgentMode) {
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action(context);
            onClose();
          }
        }
        break;
    }
  }, [filteredCommands, selectedIndex, onClose, context, isAgentMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl glass border hairline rounded-xl shadow-2xl glow-accent overflow-hidden animate-slide-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 py-3.5 border-b hairline flex items-center gap-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isAgentMode ? 'var(--cyan)' : 'var(--accent-hi)'} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            className="flex-1 text-[13.5px] placeholder-[var(--fg-faint)]"
            placeholder={isAgentMode ? 'Ask the agent…' : 'Type a command or search files… (agent: for chat)'}
            autoFocus
          />
          <span className="kbd">esc</span>
        </div>

        <div ref={listRef} className="max-h-[340px] overflow-y-auto scrollbar-thin py-1.5">
          {isAgentMode ? (
            <ChatInterface activeModule={context.selectedPath?.split('/')[1] || null} onClose={onClose} />
          ) : filteredCommands.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <div className="text-[var(--fg-faint)] text-[12px] mb-1">No results for</div>
              <div className="text-[var(--fg)] text-[13px] font-mono">"{query}"</div>
              {query && !isAgentMode && (
                <div className="mt-3 text-[11px] text-[var(--fg-muted)]">
                  Try <span className="font-mono text-[var(--accent-hi)]">agent: {query}</span> to chat instead
                </div>
              )}
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => { cmd.action(context); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={'w-full px-4 py-2 flex items-center gap-3 text-left transition-colors ' +
                    (isSelected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--border)]')}
                  style={isSelected ? { borderLeft: '2px solid var(--accent)' } : { borderLeft: '2px solid transparent' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={'text-[12.5px] font-medium truncate ' + (isSelected ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]')}>
                        {cmd.title}
                      </span>
                      {cmd.description && (
                        <span className="text-[11px] text-[var(--fg-faint)] truncate hidden sm:inline">
                          {cmd.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--elevated)] border hairline uppercase tracking-wider text-[var(--fg-faint)] flex-shrink-0">
                    {cmd.category}
                  </span>
                  {cmd.shortcut && (
                    <span className="kbd flex-shrink-0">{cmd.shortcut}</span>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 border-t hairline bg-[var(--elevated)]/50 flex items-center justify-between text-[10px] text-[var(--fg-faint)]">
          <span>
            {isAgentMode
              ? 'Agent mode — type to chat, esc to exit'
              : `${filteredCommands.length} command${filteredCommands.length !== 1 ? 's' : ''}`}
          </span>
          <span className="flex items-center gap-1.5">
            {isAgentMode ? (
              <>
                <span className="kbd">esc</span>
                <span className="mx-0.5">exit agent</span>
              </>
            ) : (
              <>
                <span className="kbd">↑↓</span>
                <span className="mx-0.5">navigate</span>
                <span className="kbd">↵</span>
                <span className="mx-0.5">run</span>
                <span className="kbd">esc</span>
                <span className="mx-0.5">close</span>
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}