'use client';

import { SignInForm } from './sign-in-form';
import { TerminalCursor } from '@/components/ui/terminal-cursor';

interface AuthEntryProps {
  next: string;
  callbackError?: string;
  mode?: 'sign-in' | 'sign-up';
  localMode?: boolean;
}

export function AuthEntry({
  next,
  callbackError,
  mode = 'sign-in',
  localMode = false,
}: AuthEntryProps) {
  return (
    <section className="auth-entry" aria-labelledby="auth-title">
      {/* Ambient background grid - Workshop constructivist */}
      <div className="auth-grid-bg" aria-hidden="true" />
      
      {/* Field Atlas coordinate marker */}
      <div className="auth-coordinate" aria-hidden="true">
        <span className="coord-label">ACCESS POINT</span>
        <span className="coord-value">00° 00′ / 0000h</span>
      </div>

      <div className="auth-card">
        {/* Terminal-style header - REPL aesthetic */}
        <div className="auth-terminal-header">
          <div className="terminal-bar">
            <div className="terminal-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="terminal-title">
              <span className="term-prompt">apt@sovereign:~$</span>
              <span className="term-command"> auth {mode === 'sign-in' ? 'login' : 'register'}</span>
              <TerminalCursor />
            </div>
          </div>
        </div>

        {/* Brand mark - Editorial Manuscript */}
        <div className="auth-brand-mark" aria-hidden="true">
          <span className="wordmark-symbol">A</span>
          <span className="wordmark-text">APT<span className="wordmark-dash">—</span>LABS</span>
        </div>

        <p className="auth-eyebrow">SOVEREIGN COORDINATION ENGINE</p>
        
        <h1 id="auth-title" className="auth-headline">
          {mode === 'sign-in' 
            ? 'Find your place<br /><em>in the work.</em>'
            : 'Join the network.<br /><em>Build what matters.</em>'}
        </h1>

        <p className="auth-intro">
          {mode === 'sign-in'
            ? 'Sign in to enter your workspace and coordinate real work.'
            : 'Create an account to access the studio and start building.'}
        </p>

        {callbackError && (
          <div className="auth-error-banner" role="alert">
            <span className="error-glyph">⚠</span>
            <span>{callbackError}</span>
          </div>
        )}

        <div className="auth-form-wrapper">
          <SignInForm localMode={localMode} next={next} mode={mode} />
        </div>

        <p className="auth-switch">
          {mode === 'sign-up' ? (
            <>Already have credentials? <a href={`/sign-in?next=${encodeURIComponent(next)}`}>Sign in</a></>
          ) : (
            <>New to the network? <a href={`/sign-up?next=${encodeURIComponent(next)}`}>Create account</a></>
          )}
        </p>

        {localMode && (
          <div className="auth-boundary" role="note">
            <span className="boundary-glyph">◈</span>
            <span>Local development identity. Opens the Studio in this browser only. Not a verified account. No server synchronization.</span>
          </div>
        )}

        <div className="auth-foot">
          <span>APT-LABS / PROTOTYPE 001</span>
          <span>LOCAL DEV — NO REMOTE SYNC</span>
        </div>
      </div>
    </section>
  );
}
