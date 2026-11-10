import { useState } from 'preact/hooks';
import { useParams } from 'wouter';
import { PageHead } from '@/components/PageHead';
import { Button } from '@/components/Button';
import {
  pilotByKey,
  workItemsForPilot,
  type PilotKey,
  type WorkItem,
} from '../data';
import '../styles/workbench.css';

export function Pilot() {
  const params = useParams<{ pilot: string }>();
  const key = (params.pilot as PilotKey) || 'benbenos';
  const pilot = pilotByKey(key);
  const items = pilot ? workItemsForPilot(key) : [];

  const [work, setWork] = useState<WorkItem[]>(items.slice());

  const claim = (id: string) => {
    setWork((ws) =>
      ws.map((w) => (w.id === id ? { ...w, status: 'claimed' } : w)),
    );
  };

  const deliver = (id: string) => {
    setWork((ws) =>
      ws.map((w) => (w.id === id ? { ...w, status: 'delivered' } : w)),
    );
  };

  if (!pilot) {
    return (
      <div className="wb-root wb-page">
        <PageHead eyebrow="APT-LABS / WORKBENCH" title="Pilot not found" />
        <p className="wb-empty">
          No such pilot lane. Register it in the workbench to open it.
        </p>
      </div>
    );
  }

  const openCount = work.filter((w) => w.status === 'open').length;
  const activeCount = work.filter(
    (w) => w.status === 'claimed' || w.status === 'in-progress',
  ).length;
  const doneCount = work.filter(
    (w) => w.status === 'delivered' || w.status === 'accepted',
  ).length;

  return (
    <div className="wb-root">
      <PageHead
        eyebrow={`Pilot · ${pilot.location}`}
        title={pilot.label}
        subtitle={pilot.summary}
        primaryAction={{ label: pilot.action, onClick: () => {} }}
        quietActions={[{ label: 'Terms', onClick: () => {} }]}
        metrics={[
          { label: 'Open work', value: openCount },
          { label: 'Claimed', value: activeCount },
          { label: 'Delivered', value: doneCount },
        ]}
      />

      <div className="wb-page">
        <p className="wb-notice">{pilot.terms}</p>

        <div className="wb-list">
          {work.map((item) => (
            <article key={item.id} className="wb-item">
              <div>
                <div className="wb-item-title">{item.title}</div>
                <div className="wb-item-meta">
                  {item.discipline} · {item.location}
                </div>
              </div>
              <span className="wb-item-value">{item.value}</span>
              <span className="wb-item-status">{item.status}</span>
              <div className="wb-item-actions">
                {item.status === 'open' && item.claimable ? (
                  <Button variant="ghost" size="sm" onClick={() => claim(item.id)}>
                    Claim work
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deliver(item.id)}
                    disabled={item.status === 'accepted'}
                  >
                    Mark delivered
                  </Button>
                )}
              </div>
            </article>
          ))}
          {work.length === 0 && (
            <p className="wb-empty">No work items in this lane yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
