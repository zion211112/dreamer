'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Tab, createTab, getMockContent } from '@/lib/editor';

interface PaneProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabChange: (id: string) => void;
  onTabClose: (id: string) => void;
  onNewTab: () => void;
  onTabUpdate: (id: string, updates: Partial<Tab>) => void;
  onOpenFile: (path: string) => void;
}

function highlightLineSafe(line: string, language: string): string {
  if (!line) return '<span></span>';
  let html = escapeHtml(line);
  if (language === 'typescript' || language === 'javascript') {
    html = html
      .replace(/(\/\/.*$)/, '<span class="comment">$1</span>')
      .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from|default|interface|type|class|extends|implements|public|private|protected|readonly|async|await|try|catch|finally|throw|new|this|super|typeof|instanceof|in|of|as|is)\b/g, '<span class="keyword">$1</span>')
      .replace(/\b(string|number|boolean|object|any|void|never|unknown|Record|Array|Promise|Map|Set|Date|Error|console)\b/g, '<span class="type">$1</span>')
      .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="string">$1</span>')
      .replace(/(\b\d+\.?\d*\b)/g, '<span class="number">$1</span>');
  } else if (language === 'json') {
    html = html
      .replace(/(".*?")\s*:/g, '<span class="key">$1</span>:')
      .replace(/:\s*(".*?")/g, ': <span class="string">$1</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="number">$1</span>')
      .replace(/:\s*(true|false|null)\b/g, ': <span class="keyword">$1</span>');
  } else if (language === 'css') {
    html = html
      .replace(/([^{}:]+)\s*{/g, '<span class="selector">$1</span> {')
      .replace(/(\s+)([^:]+):/g, '$1<span class="property">$2</span>:')
      .replace(/:\s*([^;]+);/g, ': <span class="value">$1</span>;');
  }
  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function Editor({ tab, onChange }: {
  tab: Tab;
  onChange: (content: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (highlightRef.current) {
      highlightRef.current.style.transform = `translate(${-scrollLeft}px, ${-scrollTop}px)`;
    }
    if (lineNumRef.current) {
      lineNumRef.current.style.transform = `translateY(${-scrollTop}px)`;
    }
  }, []);

  const lines = tab.content.split('\n');
  const lineNumbers = lines.map((_, i) => i + 1);

  return (
    <div className="flex-1 flex relative min-h-0">
      <div
        ref={lineNumRef}
        className="w-11 bg-[var(--surface)] border-r hairline flex flex-col items-center pt-3 select-none overflow-hidden flex-shrink-0"
        style={{ fontSize: '11px', lineHeight: '1.7' }}
      >
        {lineNumbers.map((num, i) => (
          <div key={i} className="w-full text-right pr-3 text-[var(--fg-faint)]" style={{ height: '1.7em' }}>
            {num}
          </div>
        ))}
      </div>
      <div className="flex-1 relative min-w-0">
        <textarea
          ref={textareaRef}
          className="absolute inset-0 bg-transparent border-none resize-none outline-none terminal-font tab-size-2"
          style={{
            fontSize: '12.5px',
            lineHeight: '1.7',
            padding: '10px 14px',
            color: 'var(--fg)',
            caretColor: 'var(--accent-hi)',
            background: 'transparent',
          }}
          value={tab.content}
          onChange={handleChange}
          onScroll={handleScroll}
          spellCheck={false}
        />
        <div
          ref={highlightRef}
          className="absolute inset-0 pointer-events-none terminal-font overflow-hidden"
          style={{
            fontSize: '12.5px',
            lineHeight: '1.7',
            padding: '10px 14px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: 'transparent',
          }}
        >
          {lines.map((line, i) => (
            <div key={i} style={{ height: '1.7em' }} dangerouslySetInnerHTML={{ __html: highlightLineSafe(line, tab.language) }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Pane({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  onNewTab,
  onTabUpdate,
  onOpenFile,
}: PaneProps) {
  const activeTab = tabs.find(t => t.id === activeTabId);

  const handleEditorChange = useCallback((content: string) => {
    if (activeTab) {
      onTabUpdate(activeTab.id, { content, modified: true, saved: false });
    }
  }, [activeTab, onTabUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, tabId: string) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      const tab = tabs.find(t => t.id === tabId);
      if (tab?.modified) {
        onTabUpdate(tabId, { modified: false, saved: true });
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
      e.preventDefault();
      onTabClose(tabId);
    }
  }, [tabs, onTabUpdate, onTabClose]);

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[var(--surface)]">
      <div className="flex items-center h-10 px-2 border-b hairline bg-[var(--surface)] gap-1 overflow-x-auto scrollbar-thin flex-shrink-0">
        {tabs.map(tab => {
          const isActive = tab.id === activeTabId;
          const ext = tab.path.match(/\.(\w+)$/)?.[1] || '';
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              className={'group flex items-center gap-2 pl-3 pr-2 py-1.5 text-[12px] rounded-t-md transition-all whitespace-nowrap relative max-w-[200px] ' +
                (isActive
                  ? 'bg-[var(--bg)] text-[var(--fg)]'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--border)]')}
              style={isActive ? { boxShadow: 'inset 0 2px 0 var(--accent)' } : undefined}
            >
              <span className={'text-[9px] font-mono px-1 rounded ' + (isActive ? 'text-[var(--accent-hi)] bg-[var(--accent-soft)]' : 'text-[var(--fg-faint)]')}>
                {ext || '·'}
              </span>
              <span className="truncate">{tab.name}</span>
              {tab.modified && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--warn)] flex-shrink-0" title="unsaved" />
              )}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); onTabClose(tab.id); }}
                className="ml-0.5 p-0.5 rounded hover:bg-[var(--border)] text-[var(--fg-faint)] hover:text-[var(--danger)] transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                style={{ fontSize: '12px', lineHeight: 1 }}
              >
                ×
              </span>
            </button>
          );
        })}
        <button
          onClick={onNewTab}
          className="flex items-center justify-center w-7 h-7 rounded-md text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--border)] transition-colors flex-shrink-0"
          style={{ fontSize: '15px' }}
          title="New file (Ctrl+N)"
        >
          +
        </button>
        {tabs.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-[var(--fg-muted)] text-[12px] px-4">
            No files open. Click a file in the explorer or press <span className="kbd mx-1.5">Ctrl+P</span> to search
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {activeTab ? (
          <Editor tab={activeTab} onChange={handleEditorChange} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--fg-muted)]">
            <div className="text-center p-8 animate-fade-in">
              <div
                className="w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--cyan) 100%)', boxShadow: '0 8px 32px rgba(124,108,255,0.3)' }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                </svg>
              </div>
              <h2 className="text-[15px] font-semibold text-[var(--fg)] mb-1.5">File manager for systems thinkers</h2>
              <p className="text-[12px] text-[var(--fg-muted)] mb-5">Every node is a page. Select anything to inspect it.</p>
              <div className="flex items-center justify-center gap-4 text-[11px] text-[var(--fg-faint)]">
                <span className="flex items-center gap-1.5"><span className="kbd">Ctrl+K</span> commands</span>
                <span className="flex items-center gap-1.5"><span className="kbd">Ctrl+B</span> sidebar</span>
                <span className="flex items-center gap-1.5"><span className="kbd">Ctrl+N</span> new file</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
