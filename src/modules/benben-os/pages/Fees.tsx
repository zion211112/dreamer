import { Card, CardHead, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import { FEES } from '../lib/data';

export function Fees() {
  const total = FEES.reduce((acc, f) => acc + f.amount, 0);
  const paid = FEES.reduce((acc, f) => acc + f.paid, 0);
  const outstanding = total - paid;

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
            <span className="benben-stat-value">KES {total.toLocaleString()}</span>
          </CardBody>
        </Card>
        <Card className="benben-stat-card benben-tone-can">
          <CardHead>
            <span className="benben-stat-label">Collected</span>
          </CardHead>
          <CardBody>
            <span className="benben-stat-value">KES {paid.toLocaleString()}</span>
          </CardBody>
        </Card>
        <Card className="benben-stat-card benben-tone-risk">
          <CardHead>
            <span className="benben-stat-label">Outstanding</span>
          </CardHead>
          <CardBody>
            <span className="benben-stat-value">KES {outstanding.toLocaleString()}</span>
          </CardBody>
        </Card>
      </div>

      <Card className="benben-fees-shell">
        <CardHead>
          <span className="benben-toolbar-title">Student balances</span>
          <Button variant="primary">Record payment</Button>
        </CardHead>
        <CardBody>
          <table className="benben-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Assessed</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {FEES.map((f) => {
                const balance = f.amount - f.paid;
                return (
                  <tr key={f.id} className="benben-row">
                    <td>{f.student}</td>
                    <td className="benben-mono">KES {f.amount.toLocaleString()}</td>
                    <td className="benben-mono">KES {f.paid.toLocaleString()}</td>
                    <td className="benben-mono benben-tone-risk">KES {balance.toLocaleString()}</td>
                    <td>
                      <span className={`benben-badge benben-badge--${f.status}`}>
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
