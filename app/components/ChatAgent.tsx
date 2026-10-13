'use client';

import { useEffect, useRef, useState } from 'react';
import { findFile } from '@/lib/ontology';

interface ChatAgentProps {
  isOpen: boolean;
  file: string | null;
  module: string;
  onToggle: () => void;
}

interface Msg {
  id: number;
  who: 'hermes' | 'user';
  html: string;
}

const SCRIPTED = [
  'Reading tree. I see {file} selected. Want me to audit the BOM against the import quote, or check the anchor signature chain?',
  'Note: {file} is in state {state}. I can propose the next evidence step — either fabricate a prototype or schedule an audit.',
  'Blueprint {file} is forkable. Should I emit a fork request to the Nyamindi node?',
  'The Roll shows 3 anchors on this module. Signature chain is clean. I can mint {file} now if you authorize.',
];

export function ChatAgent({ isOpen, file, module, onToggle }: ChatAgentProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Greeting on boot.
  useEffect(() => {
    setMessages([
      {
        id: Date.now(),
        who: 'hermes',
        html: 'I read the tree. <span style="color:var(--accent-hi)">kernel/issuance/core.ts</span> defines the four evidence states. Want me to wire the Roll minting to the Anchor signature check, or scaffold <span style="color:var(--accent-hi)">builds/engine/replacement-engine.ts</span> first?',
      },
    ]);
  }, []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  const agentSay = (html: string, who: 'hermes' | 'user' = 'hermes') => {
    setMessages(prev => [...prev, { id: Date.now(), who, html }]);
  };

  const agentRespond = () => {
    const f = file ? findFile(file) : null;
    const tmpl = SCRIPTED[Math.floor(Math.random() * SCRIPTED.length)];
    const reply = tmpl
      .replace(/\{file\}/g, f ? f.name : 'no file')
      .replace(/\{state\}/g, f ? f.state : 'unknown');
    setTimeout(() => agentSay(reply), 500 + Math.random() * 600);
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    agentSay(trimmed.replace(/</g, '&lt;'), 'user');
    setInput('');
    agentRespond();
  };

  void module;

  return (
    <div className={'agent' + (isOpen ? '' : ' hidden')} id="agent">
      <div className="hd">
        <div className="ic">◈</div>
        <div className="n">hermes <span>agent · v1.4</span></div>
        <button className="x" onClick={onToggle} title="Close (⌘⇧A)">×</button>
      </div>
      <div className="body" ref={bodyRef}>
        {messages.map(m => (
          <div key={m.id} className={'msg' + (m.who === 'user' ? ' user' : '')}>
            <span className="p">{m.who} ›</span>{' '}
            <span dangerouslySetInnerHTML={{ __html: m.html }} />
          </div>
        ))}
      </div>
      <div className="input">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(input); }}
          placeholder="ask hermes…"
          autoComplete="off"
        />
        <span className="k">↵</span>
      </div>
    </div>
  );
}
