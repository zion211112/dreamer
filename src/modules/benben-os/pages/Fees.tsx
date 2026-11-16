import { useMemo } from 'preact/hooks';
import { Card, CardHead, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import { LEARNERS } from '../lib/data';

const TERM_FEE = 12000;

type FeeRow = { learner: string; grade: number; assessed: number; paid: number; status: 'paid' | 'partial' | 'unpaid' };

const FEE_ROWS: FeeRow[] = useMemo(() => LEARNERS.map((l) => {
  const assessed = TERM_FEE;
  const paid = l.id.endsWith('01') || l.id.endsWith('04') || l.id.endsWith('07') || l.id.endsWith('10')
    ? assessed
    : l.id.endsWith('02') || l.id.endsWith('05') || l.id.endsWith('08')
      ? Math.round(assessed * 0.5)
      : 0;
  return {
    learner: l.name,
    grade: l.grade,
    assessed,
    paid,
    status: paid === assessed ? 'paid' : paid > 0 ? 'partial' : 'unpaid',
  };
}), [LEARNERS]);

const totals = useMemo(() => {
  const total = FEE_ROWS.reduce((acc, f) => acc + f.assessed, 0);
  const paid = FEE_ROWS.reduce((acc, f) => acc + f.paid, 0);
  return { total, paid, outstanding: total - paid };
}, [FEE_ROWS]);

export function Fees() {
  return (
    <div className="benben-page">
      <div className="benben-page-head">
        <h1 className="benben-page-title">Fees</h1>
        <p className="benben-page-sub">Fee collection, balances, and outstanding amounts.</p>
      </div>

      <div className="benben-stats">
        <Card className="benben-stat-card benben-tone-can">
          <CardHead>
            <span className="benben-stat-label">Total assessed</span>
          </CardHead>
          <CardBody>
            <span className="benben-stat-value">KES {totals.total.toLocaleString()}</span>
          </CardBody>
        </Card>
        <Card className="benben-stat-card benben-tone-can">
          <CardHead>
            <span className="benben-stat-label">Collected</span>
          </CardHead>
          <CardBody>
            <span className="benben-stat-value">KES {totals.paid.toLocaleString()}</span>
          </CardBody>
        </Card>
        <Card className="benben-stat-card benben-tone-risk">
          <CardHead>
            <span className="benben-stat-label">Outstanding</span>
          </CardHead>
          <CardBody>
            <span className="benben-stat-value">KES {totals.outstanding.toLocaleString()}</span>
          </CardBody>
        </Card>
      </div>

      <Card className="benben-fees-shell">
        <CardHead>
          <span className="benben-toolbar-title">Learner balances</span>
          <Button variant="primary">Record payment</Button>
        </CardHead>
        <CardBody>
          <table className="benben-table">
            <thead>
              <tr>
                <th>Learner</th>
                <th>Grade</th>
                <th>Assessed</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {FEE_ROWS.map((f) => {
                const balance = f.assessed - f.paid;
                return (
                  <tr key={f.learner} className="benben-row">
                    <td>{f.learner}</td>
                    <td className="benben-mono">Grade {f.grade}</td>
                    <td className="benben-mono">KES {f.assessed.toLocaleString()}</td>
                    <td className="benben-mono">KES {f.paid.toLocaleString()}</td>
                    <td className="benben-mono benben-tone-risk">KES {balance.toLocaleString()}</td>
                    <td>
                      <span className={`benben-badge benben-badge--${f.status === 'paid' ? 'paid' : f.status === 'partial' ? 'partial' : 'unpaid'}`}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
