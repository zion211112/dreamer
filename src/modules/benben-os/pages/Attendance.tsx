import { Card, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import { LEARNERS } from '../lib/data';

export function Attendance() {
  return (
    <div className="benben-page">
      <div className="benben-page-head">
        <h1 className="benben-page-title">Attendance</h1>
        <p className="benben-page-sub">Daily attendance marks by learner.</p>
      </div>

      <div className="benben-grid">
        {LEARNERS.map((s) => (
          <Card key={s.id} className="benben-attendance-card">
            <CardBody>
              <div className="benben-attendance-header">
                <div>
                  <div className="benben-attendance-name">{s.name}</div>
                  <div className="benben-attendance-grade benben-mono">Grade {s.grade} · {s.stream}</div>
                </div>
                <span className={`benben-badge benben-badge--${s.status === 'active' ? 'paid' : 'unpaid'}`}>
                  {s.status}
                </span>
              </div>
              <div className="benben-attendance-bar">
                <div className="benben-attendance-fill" style={{ width: `${s.status === 'active' ? 100 : 0}%` }} />
              </div>
              <div className="benben-attendance-actions">
                <Button variant="ghost" size="sm" onClick={() => {}}>Mark present</Button>
                <Button variant="ghost" size="sm" onClick={() => {}}>Mark absent</Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
