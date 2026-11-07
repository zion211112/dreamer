import { useEffect, useRef, useState } from 'preact/hooks';

interface EngineCommandDockProps {
  open: boolean;
  agentAvailable: boolean;
  onClose: () => void;
}

export function EngineCommandDock({ open, agentAvailable, onClose }: EngineCommandDockProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [proposalText, setProposalText] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      aria-labelledby="engine-command-title"
      className="engine-command-dock"
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      ref={dialogRef}
    >
      <div className="engine-command-panel">
        <header className="engine-panel-heading">
          <div>
            <span className="engine-panel-eyebrow">SCOPED REQUEST</span>
            <h2 id="engine-command-title">Ask engine</h2>
          </div>
          <button aria-label="Close engine dock" className="engine-panel-close" onClick={onClose} type="button">×</button>
        </header>
        <p className="engine-command-state" role="status">
          <span aria-hidden="true" />
          {agentAvailable ? 'Agent connected — scoped request only' : 'Agent not connected'}
        </p>
        {agentAvailable ? (
          <>
            <label className="engine-command-input">
              <span className="visually-hidden">Request input</span>
              <textarea
                value={proposalText}
                onInput={event => setProposalText((event.currentTarget as HTMLTextAreaElement).value)}
                placeholder="Describe what you'd like the agent to draft for this stage…"
                rows={3}
              />
            </label>
            <footer className="engine-command-footer">
              <span>The agent drafts a proposal. You execute it through the UI.</span>
              <button disabled={!proposalText.trim()} type="button" onClick={() => setProposalText('')}>
                Send request
              </button>
            </footer>
          </>
        ) : (
          <>
            <label className="engine-command-input">
              <span className="visually-hidden">Request input unavailable</span>
              <textarea disabled placeholder="Request input is unavailable" rows={3} />
            </label>
            <footer className="engine-command-footer">
              <span>No request or run will be created.</span>
              <button disabled type="button">Send request</button>
            </footer>
          </>
        )}
      </div>
    </dialog>
  );
}
