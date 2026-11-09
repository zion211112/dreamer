import { Card, CardHead, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import { TEACHERS } from '../lib/data';

export function Teachers() {
  return (
    <div className="benben-page">
      <div className="benben-page-head">
        <h1 className="benben-page-title">Teachers</h1>
        <p className="benben-page-sub">Faculty roster, subjects, and class load.</p>
      </div>

      <Card className="benben-teacher-shell">
        <CardHead>
          <span className="benben-toolbar-title">Faculty roster</span>
          <Button variant="primary">Add teacher</Button>
        </CardHead>
        <CardBody>
          <table className="benben-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Teacher</th>
                <th>Subject</th>
                <th>Classes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {TEACHERS.map((t) => (
                <tr key={t.id} className="benben-row">
                  <td className="benben-mono">{t.id}</td>
                  <td>{t.name}</td>
                  <td className="benben-mono">{t.subject}</td>
                  <td className="benben-mono">{t.classes}</td>
                  <td>
                    <span className={`benben-badge benben-badge--${t.status === 'active' ? 'paid' : 'unpaid'}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <div className="benben-grid">
        {TEACHERS.map((t) => (
          <Card key={t.id} className="benben-teacher-card">
            <CardBody>
              <div className="benben-teacher-header">
                <span className="benben-teacher-initial">{t.name.charAt(0)}</span>
                <div>
                  <div className="benben-teacher-name">{t.name}</div>
                  <div className="benben-teacher-subject">{t.subject}</div>
                </div>
              </div>
              <div className="benben-teacher-stats">
                <span className="benben-stat-label">Classes</span>
                <span className="benben-stat-value benben-mono">{t.classes}</span>
              </div>
              <div className="benben-teacher-stats">
                <span className="benben-stat-label">Status</span>
                <span className="benben-stat-value benben-mono benben-tone-${t.status === 'active' ? 'canon' : 'caution'}">{t.status}</span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
