import { useMemo } from 'preact/hooks';
import { Link } from 'wouter';
import { Card, CardHead, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import {
  STUDENTS, TEACHERS, COURSES, FEES,
  ATTENDANCE_RATE, FEES_COLLECTED,
  BENBEN_SCHOOL,
} from '../lib/data';

const ACTIVE_STUDENTS = STUDENTS.filter(s => s.status === 'active').length;
const ACTIVE_TEACHERS = TEACHERS.filter(t => t.status === 'active').length;
const PAID_FEES = FEES.filter(f => f.status === 'paid').length;

type Stat = { label: string; value: string; delta?: string; tone?: 'canon' | 'proposed' | 'risk' | 'caution' };

const STATS: Stat[] = [
  { label: 'Students', value: String(STUDENTS.length), delta: `${ACTIVE_STUDENTS} active`, tone: 'canon' },
  { label: 'Teachers', value: String(TEACHERS.length), delta: `${ACTIVE_TEACHERS} active`, tone: 'canon' },
  { label: 'Courses', value: String(COURSES.length), delta: 'In session', tone: 'proposed' },
  { label: 'Attendance', value: `${ATTENDANCE_RATE}%`, delta: 'Weekly average', tone: 'caution' },
  { label: 'Fees collected', value: `KES ${FEES_COLLECTED.toLocaleString()}`, delta: `${PAID_FEES} paid`, tone: 'risk' },
];

export function Dashboard() {
  const recent = useMemo(() => FEES.slice(0, 4), [FEES]);

  return (
    <div className="benben-page">
      <div className="benben-page-head">
        <h1 className="benben-page-title">{BENBEN_SCHOOL.name}</h1>
        <p className="benben-page-sub">{BENBEN_SCHOOL.tagline}</p>
      </div>

      <section className="benben-stats">
        {STATS.map((s) => (
          <Card className={`benben-stat-card benben-tone-${s.tone}`} key={s.label}>
            <CardHead>
              <span className="benben-stat-label">{s.label}</span>
              <span className="benben-stat-delta">{s.delta}</span>
            </CardHead>
            <CardBody>
              <span className="benben-stat-value">{s.value}</span>
            </CardBody>
          </Card>
        ))}
      </section>

      <section className="benben-grid">
        <Card className="benben-quick-actions">
          <CardHead>
            <h2 className="benben-card-title">Quick actions</h2>
          </CardHead>
          <CardBody>
            <div className="benben-action-grid">
              <Button variant="primary" className="benben-action-btn" onClick={() => {}}>
                Mark attendance
              </Button>
              <Button variant="ghost" className="benben-action-btn" onClick={() => {}}>
                Record fees
              </Button>
              <Button variant="ghost" className="benben-action-btn" onClick={() => {}}>
                Add student
              </Button>
              <Button variant="ghost" className="benben-action-btn" onClick={() => {}}>
                Schedule class
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="benben-recent-fees">
          <CardHead>
            <h2 className="benben-card-title">Recent fees</h2>
            <div className="benben-card-actions">
              <Link href="/benben-os/fees" className="benben-view-all">View all</Link>
            </div>
          </CardHead>
          <CardBody>
            <table className="benben-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((f) => (
                  <tr key={f.id}>
                    <td>{f.student}</td>
                    <td>KES {f.amount.toLocaleString()}</td>
                    <td>KES {f.paid.toLocaleString()}</td>
                    <td>
                      <span className={`benben-badge benben-badge--${f.status}`}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
